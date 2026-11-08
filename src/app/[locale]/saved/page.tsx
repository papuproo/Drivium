import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { Link } from '@/i18n/navigation';
import { VehicleListItem } from '@/components/vehicle-list-item';
import { getSavedVehicles } from '@/lib/vehicles';

type PageProps = {
    params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'saved' });
    return { title: `${t('title')} — Trideal` };
}

// "Mis guardados": misma fila de la lista (VehicleListItem), sin filtros.
// Ruta protegida: sin sesión, al login.
export default async function SavedPage({ params }: PageProps) {
    const { locale } = await params;
    setRequestLocale(locale);

    const session = await auth();
    if (!session?.user?.id) redirect(`/${locale}/login`);

    const t = await getTranslations({ locale });
    const items = await getSavedVehicles(session.user.id);

    return (
        <main className="mx-auto max-w-[1000px] px-4 py-8 md:px-8">
            {/* Encabezado con distintivo visual: marcador relleno en una "placa" de color primario */}
            <header className="mb-8 flex items-center gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                    <span
                        className="material-symbols-outlined text-[26px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                        aria-hidden="true"
                    >
                        bookmark
                    </span>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
                        {t('saved.title')}
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {t('saved.count', { count: items.length })}
                    </p>
                </div>
            </header>

            {items.length === 0 ? (
                <div className="flex flex-col items-center rounded-lg border border-dashed border-slate-300 px-6 py-16 text-center dark:border-slate-700">
                    <span className="material-symbols-outlined mb-4 text-5xl text-slate-300 dark:text-slate-600">
                        bookmark
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        {t('saved.emptyTitle')}
                    </h2>
                    <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                        {t('saved.emptyText')}
                    </p>
                    <Link
                        href="/vehicles"
                        className="mt-6 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-dark"
                    >
                        {t('saved.browse')}
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col gap-5">
                    {items.map((v) => (
                        <VehicleListItem key={v.id} vehicle={v} saved isAuthenticated />
                    ))}
                </div>
            )}
        </main>
    );
}