import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { VehicleCardDTO } from '@/lib/vehicles';

export function VehicleCard({ vehicle }: { vehicle: VehicleCardDTO }) {
    const t = useTranslations();
    const title = [vehicle.make, vehicle.model, vehicle.trim]
        .filter(Boolean)
        .join(' ');

    const price = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(vehicle.price);

    const mileage = new Intl.NumberFormat().format(vehicle.mileage);

    return (
        <Link
            href={`/vehicles/${vehicle.id}`}
            className='group block w-[300px] shrink-0 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'
        >
            <div className='relative mb-4 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800'>
                {vehicle.imageUrl ? (
                    <Image
                        src={vehicle.imageUrl}
                        alt={title}
                        width={340}
                        height={224}
                        className='h-56 w-full object-cover transition-transform duration-500 group-hover:scale-110'
                    />
                ) : (
                    <div className="flex h-56 w-full items-center justify-center text-slate-300 dark:text-slate-600">
                        <span className='material-symbols-outlined text-6xl'>directions_car</span>
                    </div>
                )}
                {vehicle.condition === 'NEW' && (
                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-900 backdrop-blur">
                        {t('featured.new')}
                    </span>
                )}
            </div>
            <div className='space-y-2 px-1'>
                <div className='flex items-start justify-between gap-2'>
                    <h3 className='text-lg font-bold text-slate-900 dark:text-white'>
                        {title}
                    </h3>
                    <span className='shrink-0 font-bold text-primary'>{price}</span>
                </div>
                <div className='flex flex-wrap gap-4 text-sm text-slate-500'>
                    <span className='flex items-center gap-1'>
                        {mileage} {t('specs.mileageUnit')}
                    </span>
                    <span className='flex items-center gap-1'>
                        <span className='material-symbols-outlined text-base'>settings</span>
                        {t(`fuel.${vehicle.fuelType}`)}
                    </span>
                    <span className='flex items-center gap-1'>
                        <span className='material-symbols-outlined text-base'>
                            calendar_today
                        </span>
                        {vehicle.year}
                    </span>
                </div>
            </div>
        </Link>
    );
}