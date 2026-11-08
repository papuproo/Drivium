import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { auth } from '@/lib/auth';
import { VehicleListItem } from '@/components/vehicle-list-item';
import { VehicleFilters, SortSelect } from '@/components/vehicle-filters';
import { getSavedVehicleIds, getVehicles, parseFilters, type RawSearchParams } from '@/lib/vehicles';

export default async function VehiclesPage({
    params,
    searchParams
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<RawSearchParams>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);
    const sp = await searchParams;
    const t = await getTranslations({ locale });
    const filters = parseFilters(sp);
    const session = await auth();
    const userId = session?.user?.id;
    const [{ items, total, hasMore, page }, savedIds] = await Promise.all([
        getVehicles(filters),
        userId ? getSavedVehicleIds(userId) : Promise.resolve(new Set<string>())
    ]);

    // Querystring para el "ver más" preservando los filtros actuales.
    const loadMoreParams = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
        const value = Array.isArray(v) ? v[0] : v;
        if (value) loadMoreParams.set(k, value);
    }
    loadMoreParams.set('page', String(page + 1));

    return (
        <main className="mx-auto max-w-[1600px] px-4 py-8 md:px-4">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white md:text-4xl">
                    {t('list.title')}
                </h1>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {t('list.results', { count: total })}
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-[18rem_1fr]">
                {/* Sidebar de filtros */}
                <aside className="md:sticky md:top-24 md:self-start">
                    <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                        <Suspense fallback={null}>
                            <VehicleFilters />
                        </Suspense>
                    </div>
                </aside>

                {/* Resultados */}
                <section className="flex flex-col gap-5">
                    <div className="flex items-center justify-end">
                        <Suspense fallback={null}>
                            <SortSelect />
                        </Suspense>
                    </div>

                    {items.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
                            {t('list.empty')}
                        </div>
                    ) : (
                        <>
                            {items.map((v) => (
                                <VehicleListItem key={v.id} vehicle={v} saved={savedIds.has(v.id)} isAuthenticated={!!userId} />
                            ))}

                            {hasMore && (
                                <div className="flex justify-center pt-4">
                                    <Link
                                        href={`/vehicles?${loadMoreParams.toString()}`}
                                        scroll={false}
                                        className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                                    >
                                        {t('list.loadMore')}
                                    </Link>
                                </div>
                            )}
                        </>
                    )}
                </section>
            </div>
        </main>
    );
}