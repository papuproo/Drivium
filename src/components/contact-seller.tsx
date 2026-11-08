'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

const primaryBtn =
    'flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-bold text-white shadow-md transition-colors hover:bg-primary-dark';

export function ContactSeller({
    isAuthenticated,
    isOwner,
    phone
}: {
    isAuthenticated: boolean;
    isOwner: boolean;
    phone: string | null;
}) {
    const t = useTranslations('detail');
    const [revealed, setRevealed] = useState(false);

    // Dueño de la publicación: no tiene sentido "contactarse" a sí mismo.
    if (isOwner) {
        return (
            <div className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <span className="material-symbols-outlined text-[18px]">sell</span>
                {t('ownListing')}
            </div>
        );
    }

    // Sin sesión: el contacto queda detrás del login.
    if (!isAuthenticated) {
        return (
            <Link href="/login" className={primaryBtn}>
                <span className="material-symbols-outlined">lock</span>
                {t('loginToContact')}
            </Link>
        );
    }

    if (revealed) {
        return (
            <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800/50">
                {phone ? (
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">call</span>
                        <span className="font-medium text-slate-500 dark:text-slate-400">
                            {t('phoneLabel')}:
                        </span>
                        <a href={`tel:${phone}`} className="font-bold text-primary hover:underline">
                            {phone}
                        </a>
                    </div>
                ) : (
                    <p className="text-slate-600 dark:text-slate-300">{t('noPhone')}</p>
                )}
            </div>
        );
    }

    return (
        <button type="button" onClick={() => setRevealed(true)} className={primaryBtn}>
            <span className="material-symbols-outlined">chat</span>
            {t('contact')}
        </button>
    );
}