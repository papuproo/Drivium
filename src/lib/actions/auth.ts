'use server';

import { AuthError } from "next-auth";
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { signIn } from "@/lib/auth";
import { prisma } from '@/lib/prisma';

export type AuthErrorCode = 'invalidDredentials' | 'invalidData' | 'emailTaken' | 'autoLoginFailed';
export type AuthFormState = { error: AuthErrorCode } | 'null';

export async function loginAction(_prevState: unknown, formData: FormData) {
    const locale = (formData.get('locale') as string) || 'es';
    try {
        await signIn('credentials', {
            email: formData.get('email'),
            password: formData.get('password'),
            redirectTo: `/${locale}/dashboard`
        });
    } catch (error) {
        if (error instanceof AuthError) {
            return { error: 'Correo o contrasenia incorrectos.' };
        }
        throw error;
    }
    return null;
}

const registerSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.email(),
    password: z.string().min(6)
});

export async function registerAction(_prevState: unknown, formData: FormData) {
    const locale = (formData.get('locale') as string) || 'es';
    const parsed = registerSchema.safeParse({
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        password: formData.get('password')
    });
    if (!parsed.success) {
        return { error: 'Revisa los datos. La password debe tener min 6 caracteres.' };
    }

    const { firstName, lastName, email, password } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        return { error: 'Ya existe una cuenta con ese correo.' };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({
        data: { firstName, lastName, email, passwordHash }
    });

    try {
        await signIn('credentials', {
            email,
            password,
            redirectTo: `/${locale}/dashboard`
        });
    } catch (error) {
        if (error instanceof AuthError) {
            return { error: 'Cuenta creada, pero fallo el inicio automatico. Inicia sesion con tu nueva cuenta.' }
        }
        throw error;
    }
    return null;
}