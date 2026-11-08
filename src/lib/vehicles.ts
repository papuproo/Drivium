import { cache } from 'react';
import { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import { isBodyType, isCondition, isFuelType, type BodyTypeValue, type Condition, type FuelTypeValue, type TransmissionValue } from '@/lib/enums';


export const PAGE_SIZE = 12;
const MAX_PAGE = 20;

export type SortKey = 'recommended' | 'price_asc' | 'price_desc' | 'newest';

export type RawSearchParams = { [key: string]: string | string[] | undefined };

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

const toInt = (v: string | string[] | undefined): number | undefined => {
    const s = first(v);
    if (!s) return undefined;
    const n = Number(s.replace(/[^\d]/g, ''));
    return Number.isFinite(n) && n > 0 ? n : undefined;
};

const toList = (v: string | string[] | undefined): string[] => {
    const s = first(v);
    if (!s) return [];
    return s
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);
};

const listItemSelect = {
    id: true,
    make: true,
    model: true,
    trim: true,
    year: true,
    price: true,
    originalPrice: true,
    currency: true,
    mileage: true,
    fuelType: true,
    transmission: true,
    bodyType: true,
    condition: true,
    horsepower: true,
    rangeMiles: true,
    city: true,
    state: true,
    images: {
        orderBy: [{ isPrimary: 'desc' }, { position: 'asc' }],
        take: 1,
        select: { url: true }
    },
    seller: {
        select: {
            firstName: true,
            lastName: true,
            ratingAvg: true,
            ratingCount: true
        }
    }
} satisfies Prisma.VehicleSelect;

export type VehicleFilters = {
    q?: string;
    conditions: Condition[];
    fuels: FuelTypeValue[];
    bodies: BodyTypeValue[];
    minPrice?: number;
    maxPrice?: number;
    minYear?: number;
    maxYear?: number;
    sort: SortKey;
    page: number;
};

export function parseFilters(sp: RawSearchParams): VehicleFilters {
    const sortRaw = first(sp.sort);
    const sort: SortKey =
        sortRaw === 'price_asc' || sortRaw === 'price_desc' || sortRaw === 'newest'
            ? sortRaw
            : 'recommended';

    const page = Math.min(MAX_PAGE, Math.max(1, toInt(sp.page) ?? 1));

    return {
        q: first(sp.q)?.trim() || undefined,
        conditions: toList(sp.condition).filter(isCondition),
        fuels: toList(sp.fuel).filter(isFuelType),
        bodies: toList(sp.body).filter(isBodyType),
        minPrice: toInt(sp.minPrice),
        maxPrice: toInt(sp.maxPrice),
        minYear: toInt(sp.minYear),
        maxYear: toInt(sp.maxYear),
        sort,
        page
    };
}

function buildWhere(f: VehicleFilters): Prisma.VehicleWhereInput {
    const where: Prisma.VehicleWhereInput = { status: 'ACTIVE' };

    if (f.q) {
        where.OR = [
            { make: { contains: f.q, mode: 'insensitive' } },
            { model: { contains: f.q, mode: 'insensitive' } },
            { trim: { contains: f.q, mode: 'insensitive' } }
        ];
    }
    if (f.conditions.length) where.condition = { in: f.conditions };
    if (f.fuels.length) where.fuelType = { in: f.fuels };
    if (f.bodies.length) where.bodyType = { in: f.bodies };

    if (f.minPrice != null || f.maxPrice != null) {
        where.price = {
            ...(f.minPrice != null ? { gte: f.minPrice } : {}),
            ...(f.maxPrice != null ? { lte: f.maxPrice } : {})
        };
    }
    if (f.minYear != null || f.maxYear != null) {
        where.year = {
            ...(f.minYear != null ? { gte: f.minYear } : {}),
            ...(f.maxYear != null ? { lte: f.maxYear } : {})
        };
    }

    return where;
}

function buildOrderBy(
    sort: SortKey
): Prisma.VehicleOrderByWithRelationInput | Prisma.VehicleOrderByWithRelationInput[] {
    switch (sort) {
        case 'price_asc':
            return { price: 'asc' };
        case 'price_desc':
            return { price: 'desc' };
        case 'newest':
            return [{ publishedAt: 'desc' }, { createdAt: 'desc' }];
        default:
            // Recomendados: destacados primero, luego lo más reciente.
            return [{ featured: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }];
    }
}

// DTO plano y serializable (Decimal -> number) para pasar a los componentes.
export type VehicleListItemDTO = {
    id: string;
    make: string;
    model: string;
    trim: string | null;
    year: number;
    price: number;
    originalPrice: number | null;
    currency: string;
    mileage: number;
    fuelType: FuelTypeValue;
    transmission: TransmissionValue;
    bodyType: BodyTypeValue;
    condition: Condition;
    horsepower: number | null;
    rangeMiles: number | null;
    city: string;
    state: string;
    imageUrl: string | null;
    sellerName: string;
    sellerRatingAvg: number;
    sellerRatingCount: number;
};

export type VehicleListResult = {
    items: VehicleListItemDTO[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
};


type ListItemRow = Prisma.VehicleGetPayload<{ select: typeof listItemSelect }>;

function toListItemDTO(v: ListItemRow): VehicleListItemDTO {
    return {
        id: v.id,
        make: v.make,
        model: v.model,
        trim: v.trim,
        year: v.year,
        price: Number(v.price),
        originalPrice: v.originalPrice != null ? Number(v.originalPrice) : null,
        currency: v.currency,
        mileage: v.mileage,
        fuelType: v.fuelType as FuelTypeValue,
        transmission: v.transmission as TransmissionValue,
        bodyType: v.bodyType as BodyTypeValue,
        condition: v.condition as Condition,
        horsepower: v.horsepower,
        rangeMiles: v.rangeMiles,
        city: v.city,
        state: v.state,
        imageUrl: v.images[0]?.url ?? null,
        sellerName: `${v.seller.firstName} ${v.seller.lastName}`.trim(),
        sellerRatingAvg: v.seller.ratingAvg,
        sellerRatingCount: v.seller.ratingCount
    };
}

export async function getVehicles(f: VehicleFilters): Promise<VehicleListResult> {
    const where = buildWhere(f);
    const take = f.page * PAGE_SIZE;
    const [rows, total] = await Promise.all([
        prisma.vehicle.findMany({
            where,
            orderBy: buildOrderBy(f.sort),
            take,
            select: listItemSelect
        }),
        prisma.vehicle.count({ where })
    ]);
    return {
        items: rows.map(toListItemDTO),
        total,
        page: f.page,
        pageSize: PAGE_SIZE,
        hasMore: total > take
    };
}


export type VehicleImageDTO = { url: string; alt: string };

export type VehicleDetailDTO = {
    id: string;
    sellerId: string;
    make: string;
    model: string;
    trim: string | null;
    year: number;
    vin: string | null;
    bodyType: BodyTypeValue;
    condition: Condition;
    fuelType: FuelTypeValue;
    transmission: TransmissionValue;
    mileage: number;
    doors: number | null;
    exteriorColor: string | null;
    interiorColor: string | null;
    horsepower: number | null;
    rangeMiles: number | null;
    price: number;
    originalPrice: number | null;
    currency: string;
    description: string | null;
    status: string;
    featured: boolean;
    city: string;
    state: string;
    zip: string | null;
    country: string;
    viewsCount: number;
    publishedAt: string | null;
    createdAt: string;
    images: VehicleImageDTO[];
    seller: {
        id: string;
        name: string;
        phone: string | null;
        city: string | null;
        state: string | null;
        ratingAvg: number;
        ratingCount: number;
        memberSince: string;
    };
};

// cache(): dedupe entre generateMetadata y la propia página en el mismo request.
export const getVehicleById = cache(async (id: string): Promise<VehicleDetailDTO | null> => {
    const v = await prisma.vehicle.findUnique({
        where: { id },
        select: {
            id: true,
            sellerId: true,
            make: true,
            model: true,
            trim: true,
            year: true,
            vin: true,
            bodyType: true,
            condition: true,
            fuelType: true,
            transmission: true,
            mileage: true,
            doors: true,
            exteriorColor: true,
            interiorColor: true,
            horsepower: true,
            rangeMiles: true,
            price: true,
            originalPrice: true,
            currency: true,
            description: true,
            status: true,
            featured: true,
            city: true,
            state: true,
            zip: true,
            country: true,
            viewsCount: true,
            publishedAt: true,
            createdAt: true,
            images: {
                orderBy: [{ isPrimary: 'desc' }, { position: 'asc' }],
                select: { url: true, altText: true }
            },
            seller: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                    city: true,
                    state: true,
                    ratingAvg: true,
                    ratingCount: true,
                    createdAt: true
                }
            }
        }
    });

    if (!v) return null;

    return {
        id: v.id,
        sellerId: v.sellerId,
        make: v.make,
        model: v.model,
        trim: v.trim,
        year: v.year,
        vin: v.vin,
        bodyType: v.bodyType as BodyTypeValue,
        condition: v.condition as Condition,
        fuelType: v.fuelType as FuelTypeValue,
        transmission: v.transmission as TransmissionValue,
        mileage: v.mileage,
        doors: v.doors,
        exteriorColor: v.exteriorColor,
        interiorColor: v.interiorColor,
        horsepower: v.horsepower,
        rangeMiles: v.rangeMiles,
        price: Number(v.price),
        originalPrice: v.originalPrice != null ? Number(v.originalPrice) : null,
        currency: v.currency,
        description: v.description,
        status: v.status,
        featured: v.featured,
        city: v.city,
        state: v.state,
        zip: v.zip,
        country: v.country,
        viewsCount: v.viewsCount,
        publishedAt: v.publishedAt ? v.publishedAt.toISOString() : null,
        createdAt: v.createdAt.toISOString(),
        images: v.images.map((img) => ({ url: img.url, alt: img.altText ?? '' })),
        seller: {
            id: v.seller.id,
            name: `${v.seller.firstName} ${v.seller.lastName}`.trim(),
            phone: v.seller.phone,
            city: v.seller.city,
            state: v.seller.state,
            ratingAvg: v.seller.ratingAvg,
            ratingCount: v.seller.ratingCount,
            memberSince: v.seller.createdAt.toISOString()
        }
    };
});


// Aqui empiezan los destacados del Home

// DTO minimo para la tarjeta vertical del carrusel vehiclecard

export type VehicleCardDTO = {
    id: string;
    make: string;
    model: string;
    trim: string | null;
    year: number;
    price: number;
    currency: string;
    mileage: number;
    fuelType: FuelTypeValue;
    condition: Condition;
    imageUrl: string | null;
};

export const FEATURED_LIMIT = 8;

// Publicaciones ACTIVE marcadas como destacadas (featured: true), las mas recientes primero.
export async function getFeaturedVehicles(limit = FEATURED_LIMIT): Promise<VehicleCardDTO[]> {
    const rows = await prisma.vehicle.findMany({
        where: { status: 'ACTIVE', featured: true },
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
        take: limit,
        select: {
            id: true,
            make: true,
            model: true,
            trim: true,
            year: true,
            price: true,
            currency: true,
            mileage: true,
            fuelType: true,
            condition: true,
            images: {
                orderBy: [{ isPrimary: 'desc' }, { position: 'asc' }],
                take: 1,
                select: { url: true }
            }
        }
    });

    return rows.map((v) => ({
        id: v.id,
        make: v.make,
        model: v.model,
        trim: v.trim,
        year: v.year,
        price: Number(v.price),
        currency: v.currency,
        mileage: v.mileage,
        fuelType: v.fuelType as FuelTypeValue,
        condition: v.condition as Condition,
        imageUrl: v.images[0]?.url ?? null
    }));
}


export async function getSavedVehicleIds(userId: string): Promise<Set<string>> {
    const rows = await prisma.favorite.findMany({
        where: { userId },
        select: { vehicleId: true }
    });
    return new Set(rows.map((r) => r.vehicleId));
}

export async function isVehicleSaved(userId: string, vehicleId: string): Promise<boolean> {
    const row = await prisma.favorite.findUnique({
        where: { userId_vehicleId: { userId, vehicleId } },
        select: { vehicleId: true }
    });
    return row !== null;
}

export async function getSavedVehicles(userId: string): Promise<VehicleListItemDTO[]> {
    const rows = await prisma.favorite.findMany({
        where: { userId, vehicle: { status: 'ACTIVE' } },
        orderBy: { createdAt: 'desc' },
        select: { vehicle: { select: listItemSelect } }
    });
    return rows.map((r) => toListItemDTO(r.vehicle));
}