import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const { handlers, signIn, signOut, auth } = NextAuth({
    session: { strategy: 'jwt' },
    pages: { signIn: '/login' },
    providers: [
        Credentials({
            credentials: { email: {}, password: {} },
            authorize: async (credentials) => {
                const parsed = z
                    .object({ email: z.email(), password: z.string().min(6) })
                    .safeParse(credentials);
                if (!parsed.success) return null;
                const { email, password } = parsed.data;
                const user = await prisma.user.findUnique({ where: { email } });
                if (!user) return null;
                const valid = await bcrypt.compare(password, user.passwordHash);
                if (!valid) return null;

                return {
                    id: user.id,
                    email: user.email,
                    name: `${user.firstName} ${user.lastName}`,
                    role: user.role
                };
            }
        })
    ],

    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.id = user.id as string;
                token.role = user.role;
            }
            return token;
        },
        session({ session, token }) {
            session.user.id = token.id;
            session.user.role = token.role;
            return session;
        }
    }
});