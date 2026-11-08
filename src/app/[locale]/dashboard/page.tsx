import { redirect } from 'next/navigation';
import { auth, signOut } from '@/lib/auth';
import { getTranslations } from 'next-intl/server';

const ROLES = ['BUYER', 'SELLER', 'BOTH', 'ADMIN'] as const;
type Role = (typeof ROLES)[number];
const isRole = (v: string): v is Role => (ROLES as readonly string[]).includes(v);

export default async function DashboardPage({
    params
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const session = await auth();

    // Protección a nivel de página: sin sesión, fuera.
    if (!session) redirect(`/${locale}/login`);
    const t = await getTranslations({ locale });
    const role = isRole(session.user.role)
        ? t(`dashboard.roles.${session.user.role}`)
        : session.user.role;

    return (
        <main className="mx-auto max-w-2xl px-6 py-16">
            <h1 className="text-3xl font-extrabold">
                {t('dashboard.greeting', { name: session.user.name ?? '' })}
            </h1>
            <p className="mt-2 text-slate-500">
                {session.user.email} — rol: {session.user.role}
            </p>

            <form
                action={async () => {
                    'use server';
                    await signOut({ redirectTo: `/${locale}/login` });
                }}
                className="mt-8"
            >
                <button className="rounded-lg bg-slate-900 px-5 py-2.5 font-bold text-white dark:bg-white dark:text-slate-900">
                    {t('nav.logout')}
                </button>
            </form>
        </main>
    );
}