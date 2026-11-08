'use client';

import { useOptimistic, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { toggleSavedAction } from "@/lib/actions/vehicle";


export function SaveButton({
    vehicleId,
    saved,
    isAuthenticated,
    withLabel = false,
    fullWidth = false
}: {
    vehicleId: string;
    saved: boolean;
    isAuthenticated: boolean;
    withLabel?: boolean;
    fullWidth?: boolean;
}) {
    const t = useTranslations('saved');
    const locale = useLocale();
    const [optimisticSaved, setOptimisticSaved] = useOptimistic(saved);
    const [pending, startTransition] = useTransition();
    const cls = ['flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-wait',
        fullWidth ? 'w-full' : '',
        optimisticSaved
            ? 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/15'
            : 'border-slate-300 text-slate-600 hover:border-primary hover:text-primary dark:border-slate-600 dark:text-slate-300'
    ].join(' ');
    const icon = (
        <span
            className="material-symbols-outlined text-[20px]"
            // FILL 1 = ícono relleno. globals.css deja FILL 0 por defecto.
            style={optimisticSaved ? { fontVariationSettings: "'FILL' 1" } : undefined}
            aria-hidden="true"
        >
            bookmark
        </span>
    );

    if (!isAuthenticated) {
        return (
            <Link href='/login' aria-label={t('loginToSave')} title={t('loginToSave')} className={cls}>
                {icon}
                {withLabel && t('save')}
            </Link>
        );
    }

    const toggle = () => {
        startTransition(async () => {
            setOptimisticSaved(!optimisticSaved);
            const formData = new FormData();
            formData.set('vehicleId', vehicleId);
            formData.set('locale', locale);
            await toggleSavedAction(formData);
        });
    };
    const label = optimisticSaved ? t('unsaveAria') : t('saveAria');

    return (
        <button type="button" onClick={toggle} disabled={pending} aria-pressed={optimisticSaved} aria-busy={pending} aria-label={label} title={label} className={cls}></button>
    );
}