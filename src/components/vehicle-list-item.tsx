import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import type { VehicleListItemDTO } from '@/lib/vehicles';
import { milesToKm } from '@/lib/units';
import { useTranslations } from 'next-intl';
import { SaveButton } from './save-button';

const FUEL_ICON: Record<string, string> = {
    GASOLINE: 'local_gas_station',
    DIESEL: 'local_gas_station',
    ELECTRIC: 'ev_station',
    HYBRID: 'eco',
    PLUGIN_HYBRID: 'eco'
};

function Spec({ icon, label }: { icon: string; label: string }) {
    return (
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <span className="material-symbols-outlined text-[20px] text-slate-400">{icon}</span>
            <span className="truncate">{label}</span>
        </div>
    );
}

export function VehicleListItem({ vehicle, saved = false, isAuthenticated = false }: { vehicle: VehicleListItemDTO; saved?: boolean; isAuthenticated?: boolean; }) {

    const t = useTranslations();
    const title = [vehicle.year, vehicle.make, vehicle.model, vehicle.trim]
        .filter(Boolean)
        .join(' ');
    const fmt = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: vehicle.currency || 'USD',
        maximumFractionDigits: 0
    });
    const price = fmt.format(vehicle.price);
    const original =
        vehicle.originalPrice && vehicle.originalPrice > vehicle.price
            ? fmt.format(vehicle.originalPrice)
            : null;
    const mileage = new Intl.NumberFormat().format(vehicle.mileage);
    const href = `/vehicles/${vehicle.id}`;

    // Cuarto dato: autonomía (eléctricos/híbridos) > potencia > ubicación.
    const fourth = vehicle.rangeMiles
        ? { icon: 'battery_charging_full', label: t('list.rangeMiles', { n: new Intl.NumberFormat().format(milesToKm(vehicle.rangeMiles)) }) }
        : vehicle.horsepower
            ? { icon: 'bolt', label: t('list.horsepower', { n: new Intl.NumberFormat().format(vehicle.horsepower) }) }
            : { icon: 'location_on', label: `${vehicle.city}, ${vehicle.state}` };

    return (
        <div className="group flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800 md:h-64 md:flex-row">
            {/* Imagen */}
            <Link
                href={href}
                className="relative block w-full shrink-0 bg-slate-100 dark:bg-slate-900 md:w-80 lg:w-96"
            >
                {vehicle.imageUrl ? (
                    <Image
                        src={vehicle.imageUrl}
                        alt={title}
                        width={384}
                        height={256}
                        className="h-48 w-full object-cover md:h-full"
                    />
                ) : (
                    <div className="flex h-48 w-full items-center justify-center text-slate-300 dark:text-slate-600 md:h-full">
                        <span className="material-symbols-outlined text-6xl">directions_car</span>
                    </div>
                )}
                {vehicle.condition === 'NEW' && (
                    <span className="absolute left-3 top-3 rounded bg-blue-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-primary dark:bg-blue-900/40">
                        {t('list.newBadge')}
                    </span>
                )}
                {vehicle.condition === 'CERTIFIED_PRE_OWNED' && (
                    <span className="absolute left-3 top-3 rounded bg-emerald-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                        {t('list.cpoBadge')}
                    </span>
                )}
            </Link>

            {/* Contenido */}
            <div className="flex flex-1 flex-col justify-between p-5">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <Link href={href}>
                            <h2 className="mb-1 text-xl font-bold text-slate-900 transition-colors hover:text-primary dark:text-white md:text-2xl">
                                {title}
                            </h2>
                        </Link>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {t(`bodyType.${vehicle.bodyType}`)} · {t(`condition.${vehicle.condition}`)}
                        </p>
                    </div>
                    <div className="shrink-0 text-right">
                        <h3 className="text-2xl font-bold text-primary">{price}</h3>
                        {original && <p className="text-xs text-slate-400 line-through">{original}</p>}
                    </div>
                </div>

                {/* Specs */}
                <div className="my-4 grid grid-cols-2 gap-x-6 gap-y-3 border-y border-slate-100 py-4 dark:border-slate-700/50 lg:grid-cols-4">
                    <Spec icon="speed" label={`${mileage} ${t('specs.mileageUnit')}`} />
                    <Spec
                        icon={FUEL_ICON[vehicle.fuelType] ?? 'local_gas_station'}
                        label={t(`fuel.${vehicle.fuelType}`)}
                    />
                    <Spec icon="settings" label={t(`transmission.${vehicle.transmission}`)} />
                    <Spec icon={fourth.icon} label={fourth.label} />
                </div>

                {/* Vendedor + acciones */}
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-full bg-slate-200 text-slate-500 dark:bg-slate-700">
                            <span className="material-symbols-outlined text-[18px]">person</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="flex items-center gap-1 text-sm font-bold text-slate-900 dark:text-white">
                                {vehicle.sellerName}
                                {vehicle.sellerRatingCount > 0 && (
                                    <>
                                        <span className="material-symbols-outlined text-[14px] text-yellow-400">
                                            star
                                        </span>
                                        <span className="text-xs font-normal text-slate-500">
                                            {vehicle.sellerRatingAvg.toFixed(1)}
                                        </span>
                                    </>
                                )}
                            </span>
                            <span className="text-xs text-slate-500">
                                {vehicle.city}, {vehicle.state}
                            </span>
                        </div>
                    </div>
                    <div className="flex w-full gap-3 sm:w-auto">
                        <SaveButton vehicleId={vehicle.id} saved={saved} isAuthenticated={isAuthenticated} />
                        <Link
                            href={href}
                            className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-center text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700 sm:flex-none"
                        >
                            {t('list.details')}
                        </Link>
                        <Link
                            href={href}
                            className="flex-1 rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-dark sm:flex-none"
                        >
                            {t('list.contact')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}