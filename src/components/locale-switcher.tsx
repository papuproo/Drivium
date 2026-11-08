'use client';

import { useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Link, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

export function LocaleSwitcher() {
    const locale = useLocale();
    const pathname = usePathname();
    const qs = useSearchParams().toString();
    const href = qs ? `${pathname}?${qs}` : pathname; // conserva los filtros

    return (
        <div className="flex items-center gap-1 text-sm font-semibold">
            {routing.locales.map((l, i) => (
                <span key={l} className="flex items-center gap-1">
                    {i > 0 && <span className="text-slate-300">/</span>}
                    <Link
                        href={href}
                        locale={l}
                        aria-current={l === locale ? 'true' : undefined}
                        className={l === locale ? 'text-primary' : 'text-slate-400 hover:text-primary'}
                    >
                        {l.toUpperCase()}
                    </Link>
                </span>
            ))}
        </div>
    );
}