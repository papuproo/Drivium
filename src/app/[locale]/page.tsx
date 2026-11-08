import Image from 'next/image';
import Form from 'next/form';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { VehicleCard } from '@/components/vehicle-card';
import { getFeaturedVehicles } from '@/lib/vehicles';

const HERO_IMAGE =
    'https://www.topgear.com/sites/default/files/2025/09/21983_2025_K4.jpg?w=1784&h=1004';

export default async function HomePage({
    params
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations({ locale });
    const featured = await getFeaturedVehicles();

    return (
        <div className="flex min-h-screen flex-col">

            {/* Hero */}
            <section className="relative flex h-[70vh] items-center justify-center overflow-hidden px-6">
                <Image
                    src={HERO_IMAGE}
                    alt=""
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 to-slate-900/20" />

                <div className="relative z-10 w-full max-w-4xl">
                    <div className="rounded-3xl border border-white/20 bg-white/15 p-8 shadow-2xl backdrop-blur-md md:p-12">
                        <h1 className="mb-6 text-4xl font-extrabold leading-tight text-white md:text-6xl">
                            {t('hero.titleLine1')}
                            <br />
                            <span className="text-primary">{t('hero.titleLine2')}</span>
                        </h1>
                        <p className="mb-8 max-w-xl text-lg font-medium text-white/90">
                            {t('hero.subtitle')}
                        </p>

                        {/* Formulario GET: al enviar navega a /{locale}/vehicles?q=...&maxPrice=...
                            (la lista ya lee esos parámetros en parseFilters). */}
                        <Form
                            action={`/${locale}/vehicles`}
                            className="flex flex-col gap-4 rounded-xl bg-white p-2 shadow-xl dark:bg-slate-900 md:flex-row"
                        >
                            <div className="flex flex-1 items-center border-b border-slate-100 px-4 py-3 dark:border-slate-800 md:border-b-0 md:border-r">
                                <span className="material-symbols-outlined mr-3 text-slate-400">
                                    search
                                </span>
                                <input
                                    name="q"
                                    aria-label={t('hero.searchPlaceholder')}
                                    className="w-full border-none bg-transparent p-0 text-slate-900 placeholder:text-slate-400 focus:ring-0 dark:text-white"
                                    placeholder={t('hero.searchPlaceholder')}
                                />
                            </div>
                            <div className="flex flex-1 items-center px-4 py-3">
                                <span className="material-symbols-outlined mr-3 text-slate-400">
                                    payments
                                </span>
                                <input
                                    name="maxPrice"
                                    inputMode="numeric"
                                    aria-label={t('hero.budgetPlaceholder')}
                                    className="w-full border-none bg-transparent p-0 text-slate-900 placeholder:text-slate-400 focus:ring-0 dark:text-white"
                                    placeholder={t('hero.budgetPlaceholder')}
                                />
                            </div>
                            <button type="submit" className="flex items-center justify-center gap-2 rounded-lg bg-primary px-10 py-4 font-bold text-white transition-all hover:bg-primary-dark">
                                {t('hero.searchButton')}
                                <span className="material-symbols-outlined text-base">
                                    arrow_forward
                                </span>
                            </button>
                        </Form>
                    </div>
                </div>
            </section>

            {/* Vehículos destacados */}
            {featured.length > 0 && (
                <section className="bg-white py-24 dark:bg-background-dark">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="mb-12">
                            <span className="text-xs font-bold uppercase tracking-widest text-primary">
                                {t('featured.eyebrow')}
                            </span>
                            <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
                                {t('featured.title')}
                            </h2>
                        </div>

                        <div className="flex gap-6 overflow-x-auto pb-8">
                            {featured.map((vehicle) => (
                                <VehicleCard key={vehicle.id} vehicle={vehicle} />
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}