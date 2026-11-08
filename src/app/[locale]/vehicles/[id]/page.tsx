import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { Link } from '@/i18n/navigation';
import { getVehicleById, isVehicleSaved } from '@/lib/vehicles';
import { milesToKm } from '@/lib/units';
import { VehicleGallery } from '@/components/vehicle-gallery';
import { ContactSeller } from '@/components/contact-seller';
import { SaveButton } from '@/components/save-button';

const FUEL_ICON: Record<string, string> = {
    GASOLINE: 'local_gas_station',
    DIESEL: 'local_gas_station',
    ELECTRIC: 'ev_station',
    HYBRID: 'eco',
    PLUGIN_HYBRID: 'eco'
};

type PageProps = {
    params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const v = await getVehicleById(id);
    // Sin datos (o no publicada): metadata genérica, sin revelar la publicación.
    if (!v || v.status !== 'ACTIVE') return { title: 'AutoMarket' };
    const title = [v.year, v.make, v.model, v.trim].filter(Boolean).join(' ');
    return {
        title: `${title} — AutoMarket`,
        description: v.description?.slice(0, 160) ?? undefined
    };
}

export default async function VehicleDetailPage({ params }: PageProps) {
    const { locale, id } = await params;
    setRequestLocale(locale);

    const v = await getVehicleById(id);
    if (!v) notFound();

    const t = await getTranslations({ locale });
    const session = await auth();
    const isAuthenticated = !!session?.user?.id;
    const isOwner = session?.user?.id === v.sellerId;

    // Solo las publicaciones ACTIVE son públicas. El dueño sí puede ver las suyas
    // en cualquier estado (borrador, pausada, vendida) para revisarlas.
    if (v.status !== 'ACTIVE' && !isOwner) notFound();
    // El teléfono solo se expone a usuarios autenticados que no sean el dueño.
    const contactPhone = isAuthenticated && !isOwner ? v.seller.phone : null;
    const userId = session?.user?.id;
    const saved = userId && !isOwner ? await isVehicleSaved(userId, v.id) : false;

    const title = [v.year, v.make, v.model, v.trim].filter(Boolean).join(' ');
    const num = new Intl.NumberFormat();
    const money = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: v.currency || 'USD',
        maximumFractionDigits: 0
    });
    const price = money.format(v.price);
    const original =
        v.originalPrice && v.originalPrice > v.price ? money.format(v.originalPrice) : null;

    const memberSince = new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long'
    }).format(new Date(v.seller.memberSince));
    const published = new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(new Date(v.publishedAt ?? v.createdAt));

    // Specs: se omiten los campos opcionales que estén vacíos.
    const specs = [
        { icon: 'speed', label: t('detail.specMileage'), value: `${num.format(v.mileage)} ${t('specs.mileageUnit')}` },
        { icon: FUEL_ICON[v.fuelType] ?? 'local_gas_station', label: t('detail.specFuel'), value: t(`fuel.${v.fuelType}`) },
        { icon: 'settings', label: t('detail.specTransmission'), value: t(`transmission.${v.transmission}`) },
        { icon: 'directions_car', label: t('detail.specBody'), value: t(`bodyType.${v.bodyType}`) },
        { icon: 'verified', label: t('detail.specCondition'), value: t(`condition.${v.condition}`) },
        { icon: 'calendar_today', label: t('detail.specYear'), value: String(v.year) },
        v.doors ? { icon: 'sensor_door', label: t('detail.specDoors'), value: String(v.doors) } : null,
        v.exteriorColor ? { icon: 'palette', label: t('detail.specExterior'), value: v.exteriorColor } : null,
        v.interiorColor ? { icon: 'airline_seat_recline_normal', label: t('detail.specInterior'), value: v.interiorColor } : null,
        v.horsepower ? { icon: 'bolt', label: t('detail.specPower'), value: `${num.format(v.horsepower)} HP` } : null,
        v.rangeMiles ? { icon: 'battery_charging_full', label: t('detail.specRange'), value: `${num.format(milesToKm(v.rangeMiles))} km` } : null,
        v.vin ? { icon: 'tag', label: t('detail.specVin'), value: v.vin } : null
    ].filter((s): s is { icon: string; label: string; value: string } => s !== null);

    return (
        <main className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="mb-6 flex items-center gap-2 text-sm">
                <Link href="/vehicles" className="text-slate-500 transition-colors hover:text-primary dark:text-slate-400">
                    {t('detail.breadcrumbList')}
                </Link>
                <span className="text-slate-400 dark:text-slate-600">/</span>
                <span className="font-semibold text-slate-900 dark:text-white">{title}</span>
            </nav>

            <div className="flex flex-col gap-8 lg:flex-row">
                {/* Columna izquierda */}
                <div className="flex w-full flex-col gap-8 lg:w-2/3">
                    {v.images.length > 0 ? (
                        <VehicleGallery images={v.images} title={title} />
                    ) : (
                        <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-600">
                            <span className="material-symbols-outlined text-7xl">directions_car</span>
                        </div>
                    )}

                    {/* Descripción */}
                    <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                            <span className="material-symbols-outlined text-primary">description</span>
                            {t('detail.descriptionTitle')}
                        </h3>
                        <p className="whitespace-pre-line leading-relaxed text-slate-600 dark:text-slate-300">
                            {v.description || t('detail.noDescription')}
                        </p>
                    </section>

                    {/* Especificaciones */}
                    <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                            <span className="material-symbols-outlined text-primary">tune</span>
                            {t('detail.specsTitle')}
                        </h3>
                        <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
                            {specs.map((s) => (
                                <div key={s.label} className="flex items-start gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
                                    <div className="rounded-full bg-primary/10 p-2 text-primary">
                                        <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            {s.label}
                                        </p>
                                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white md:text-base">
                                            {s.value}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Ubicación */}
                    <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                            <span className="material-symbols-outlined text-primary">location_on</span>
                            {t('detail.locationTitle')}
                        </h3>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            <span className="material-symbols-outlined text-red-500">place</span>
                            <span className="font-medium">
                                {v.city}, {v.state}
                                {v.zip ? ` ${v.zip}` : ''}
                            </span>
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <div className="w-full lg:w-1/3">
                    <div className="flex flex-col gap-4 lg:sticky lg:top-24">
                        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                            <div className="mb-4 border-b border-slate-100 pb-4 dark:border-slate-700">
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                    <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-primary">
                                        {t(`condition.${v.condition}`)}
                                    </span>
                                    {original && (
                                        <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                            {t('detail.dealBadge')}
                                        </span>
                                    )}
                                </div>
                                <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
                                    {title}
                                </h1>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-primary">{price}</span>
                                    {original && (
                                        <span className="text-sm text-slate-500 line-through dark:text-slate-400">
                                            {original}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Vendedor */}
                            <div className="mb-6 flex items-center gap-4">
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500 dark:bg-slate-700">
                                    <span className="material-symbols-outlined">person</span>
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                                        {v.seller.name}
                                    </p>
                                    <div className="flex items-center gap-1 text-sm">
                                        {v.seller.ratingCount > 0 ? (
                                            <>
                                                <span className="material-symbols-outlined text-[16px] text-yellow-400">star</span>
                                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                                    {v.seller.ratingAvg.toFixed(1)}
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    ({t('detail.reviews', { count: v.seller.ratingCount })})
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-xs text-slate-400">
                                                {t('detail.sellerSince', { date: memberSince })}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* CTA */}
                            <ContactSeller
                                isAuthenticated={isAuthenticated}
                                isOwner={isOwner}
                                phone={contactPhone}
                            />

                            {!isOwner && (
                                <div className='mt-3'>
                                    <SaveButton vehicleId={v.id} saved={saved} isAuthenticated={isAuthenticated} withLabel fullWidth />
                                </div>
                            )}

                            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                                    {t('detail.views', { count: v.viewsCount })}
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[16px]">history</span>
                                    {t('detail.publishedOn', { date: published })}
                                </span>
                            </div>
                        </div>

                        {/* Confianza (contenido estático) */}
                        <div className="rounded-xl border border-primary/10 bg-primary/5 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                            <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                                <span className="material-symbols-outlined text-[18px] text-primary">shield</span>
                                {t('detail.trustTitle')}
                            </h4>
                            <ul className="list-disc space-y-1.5 pl-4 text-xs text-slate-600 dark:text-slate-400">
                                <li>{t('detail.trust1')}</li>
                                <li>{t('detail.trust2')}</li>
                                <li>{t('detail.trust3')}</li>
                            </ul>
                        </div>

                        <Link
                            href="/vehicles"
                            className="flex items-center justify-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-primary dark:text-slate-400"
                        >
                            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                            {t('detail.backToList')}
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}