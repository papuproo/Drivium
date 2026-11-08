'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BODY_TYPES, CONDITIONS, FUEL_TYPES, TRANSMISSIONS } from '../enums';


const optionalString = z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined));

const toDigits = (v: unknown) => (typeof v === 'string' ? v.replace(/[^\d.]/g, '') : v);
const toPrice = (v: unknown) => (typeof v === 'string' ? v.replace(/[^\d.]/g, '') : v);
const currentYear = new Date().getFullYear();

const vehicleSchema = z.object({
    make: z.string().trim().min(1),
    model: z.string().trim().min(1),
    trim: optionalString,
    year: z.coerce.number().int().min(1900).max(currentYear + 1),
    mileage: z.preprocess(toDigits, z.coerce.number().int().min(0)),
    condition: z.enum(CONDITIONS),
    bodyType: z.enum(BODY_TYPES),
    fuelType: z.enum(FUEL_TYPES),
    transmission: z.enum(TRANSMISSIONS),
    doors: z.preprocess(
        (v) => (v === '' || v == null ? undefined : v),
        z.coerce.number().int().min(1).max(7).optional()
    ),
    exteriorColor: optionalString,
    interiorColor: optionalString,
    description: optionalString,
    price: z.preprocess(toPrice, z.coerce.number().positive()),
    city: z.string().trim().min(1),
    state: z.string().trim().min(1),
    zip: optionalString
});

export async function createVehicleAction(_prevState: unknown, formData: FormData) {
    const locale = (formData.get('locale') as string) || 'es';

    // Defensa en profundidad: la página ya está protegida, pero el action también.
    const session = await auth();
    if (!session?.user?.id) {
        redirect(`/${locale}/login`);
    }

    const parsed = vehicleSchema.safeParse({
        make: formData.get('make'),
        model: formData.get('model'),
        trim: formData.get('trim'),
        year: formData.get('year'),
        mileage: formData.get('mileage'),
        condition: formData.get('condition'),
        bodyType: formData.get('bodyType'),
        fuelType: formData.get('fuelType'),
        transmission: formData.get('transmission'),
        doors: formData.get('doors'),
        exteriorColor: formData.get('exteriorColor'),
        interiorColor: formData.get('interiorColor'),
        description: formData.get('description'),
        price: formData.get('price'),
        city: formData.get('city'),
        state: formData.get('state'),
        zip: formData.get('zip')
    });

    if (!parsed.success) {
        return { error: 'invalid' as const };
    }

    // URLs de imagen: 0..n entradas "imageUrl". Se validan y se descartan vacías.
    const imageUrls = formData
        .getAll('imageUrl')
        .map((v) => String(v).trim())
        .filter((v) => v.length > 0 && z.url({ protocol: /^https$/ }).safeParse(v).success);

    const d = parsed.data;

    let vehicleId: string;
    try {
        const vehicle = await prisma.vehicle.create({
            data: {
                sellerId: session.user.id,
                make: d.make,
                model: d.model,
                trim: d.trim,
                year: d.year,
                mileage: d.mileage,
                condition: d.condition,
                bodyType: d.bodyType,
                fuelType: d.fuelType,
                transmission: d.transmission,
                doors: d.doors,
                exteriorColor: d.exteriorColor,
                interiorColor: d.interiorColor,
                description: d.description,
                // Decimal: se pasa como string para no perder precisión con floats.
                price: d.price.toString(),
                city: d.city,
                state: d.state,
                zip: d.zip,
                status: 'ACTIVE',
                publishedAt: new Date(),
                images: imageUrls.length
                    ? {
                        create: imageUrls.map((url, i) => ({
                            url,
                            isPrimary: i === 0,
                            position: i
                        }))
                    }
                    : undefined
            },
            select: { id: true }
        });
        vehicleId = vehicle.id;
    } catch (error) {
        console.error('createVehicleAction:', error);
        return { error: 'server' as const };
    }

    // Refresca la lista (Tarea 2) y lleva al detalle (Tarea 3).
    revalidatePath(`/${locale}/vehicles`);
    redirect(`/${locale}/vehicles/${vehicleId}`);
}


export async function toggleSavedAction(formData: FormData) {
    const rawLocale = String(formData.get('locale') ?? '');
    const locale = rawLocale === 'en' ? 'en' : 'es';
    const session = await auth();
    if (!session?.user?.id) {
        redirect(`/${locale}/login`);
    }
    const userId = session.user.id;
    const parsed = z.string().min(1).safeParse(formData.get('vehicleId'));
    if (!parsed.success) return;
    const vehicleId = parsed.data;
    const key = { userId_vehicleId: { userId, vehicleId } };
    const existing = await prisma.favorite.findUnique({ where: key, select: { vehicleId: true } });
    if (existing) {
        await prisma.favorite.deleteMany({ where: { userId, vehicleId } });
    } else {
        const vehicle = await prisma.vehicle.findUnique({
            where: { id: vehicleId },
            select: { status: true }
        });
        if (vehicle?.status !== 'ACTIVE') return;
        await prisma.favorite.upsert({ where: key, create: { userId, vehicleId }, update: {} });
    }

    revalidatePath(`/${locale}`, 'layout');
}