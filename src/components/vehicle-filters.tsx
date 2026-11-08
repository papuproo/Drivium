'use client';

import { useCallback, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { BODY_TYPES, CONDITIONS, FUEL_TYPES } from '@/lib/enums';

type RangeKey = 'minPrice' | 'maxPrice' | 'minYear' | 'maxYear';

// Hook compartido: lee los params actuales y navega preservando el resto.
function useFilterNav() {
    const router = useRouter();
    const pathname = usePathname();
    const sp = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const push = useCallback(
        (mutate: (p: URLSearchParams) => void) => {
            const params = new URLSearchParams(sp.toString());
            mutate(params);
            params.delete('page'); // cualquier cambio de filtro/orden vuelve a página 1
            const qs = params.toString();
            startTransition(() => {
                router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
            });
        },
        [sp, pathname, router]
    );

    return { sp, pathname, router, isPending, push, startTransition };
}

const inputCls =
    'w-full rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white';

// Campo numérico con estado local. El padre le asigna key={valor en la URL}:
// cuando la URL cambia (al confirmar o con "Limpiar"), React lo vuelve a montar
// con el valor nuevo. Mientras el usuario escribe, la URL no cambia y no se pierde
// nada. Así no hace falta un useEffect para sincronizar.
function RangeInput({
    name,
    initial,
    placeholder,
    onCommit
}: {
    name: RangeKey;
    initial: string;
    placeholder: string;
    onCommit: (name: RangeKey, value: string) => void;
}) {
    const [value, setValue] = useState(initial);

    const commit = () => {
        const digits = value.replace(/[^\d]/g, '');
        if (digits === initial) {
            setValue(initial); // normaliza lo escrito (p. ej. letras) sin ir al servidor
            return;
        }
        onCommit(name, digits);
    };

    return (
        <input
            inputMode="numeric"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
                if (e.key === 'Enter') commit();
            }}
            placeholder={placeholder}
            className={inputCls}
        />
    );
}

export function VehicleFilters() {
    const t = useTranslations();
    const { sp, pathname, router, isPending, push, startTransition } = useFilterNav();

    const inList = (key: string, value: string) =>
        (sp.get(key)?.split(',').filter(Boolean) ?? []).includes(value);

    const toggle = (key: string, value: string) =>
        push((p) => {
            const set = new Set(p.get(key)?.split(',').filter(Boolean) ?? []);
            if (set.has(value)) set.delete(value);
            else set.add(value);
            if (set.size) p.set(key, [...set].join(','));
            else p.delete(key);
        });

    const setParam = (key: string, value: string) =>
        push((p) => {
            if (value) p.set(key, value);
            else p.delete(key);
        });

    const range = (key: RangeKey) => sp.get(key) ?? '';

    const hasFilters = [...sp.keys()].some((k) => k !== 'sort' && k !== 'page');

    const reset = () =>
        startTransition(() => router.replace(pathname, { scroll: false }));

    return (
        <div className={`flex flex-col gap-6 ${isPending ? 'opacity-60' : ''}`}>
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {t('filters.title')}
                </h2>
                {hasFilters && (
                    <button
                        type="button"
                        onClick={reset}
                        className="text-sm font-medium text-primary hover:text-primary-dark"
                    >
                        {t('filters.reset')}
                    </button>
                )}
            </div>

            {/* Precio */}
            <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {t('filters.price')}
                </h3>
                <div className="flex items-center gap-2">
                    <RangeInput
                        key={`minPrice:${range('minPrice')}`}
                        name="minPrice"
                        initial={range('minPrice')}
                        placeholder={t('filters.minPrice')}
                        onCommit={setParam}
                    />
                    <span className="text-slate-400">–</span>
                    <RangeInput
                        key={`maxPrice:${range('maxPrice')}`}
                        name="maxPrice"
                        initial={range('maxPrice')}
                        placeholder={t('filters.maxPrice')}
                        onCommit={setParam}
                    />
                </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Condición */}
            <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {t('filters.condition')}
                </h3>
                {CONDITIONS.map((c) => (
                    <label key={c} className="group flex cursor-pointer items-center gap-3">
                        <input
                            type="checkbox"
                            checked={inList('condition', c)}
                            onChange={() => toggle('condition', c)}
                            className="size-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-800"
                        />
                        <span className="text-sm text-slate-600 group-hover:text-slate-900 dark:text-slate-300 dark:group-hover:text-white">
                            {t(`condition.${c}`)}
                        </span>
                    </label>
                ))}
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Combustible */}
            <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {t('filters.fuel')}
                </h3>
                {FUEL_TYPES.map((f) => (
                    <label key={f} className="group flex cursor-pointer items-center gap-3">
                        <input
                            type="checkbox"
                            checked={inList('fuel', f)}
                            onChange={() => toggle('fuel', f)}
                            className="size-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-800"
                        />
                        <span className="text-sm text-slate-600 group-hover:text-slate-900 dark:text-slate-300 dark:group-hover:text-white">
                            {t(`fuel.${f}`)}
                        </span>
                    </label>
                ))}
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Carrocería */}
            <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {t('filters.body')}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                    {BODY_TYPES.map((b) => {
                        const active = inList('body', b);
                        return (
                            <button
                                key={b}
                                type="button"
                                onClick={() => toggle('body', b)}
                                className={`rounded border p-2 text-sm transition-all ${active
                                        ? 'border-primary bg-primary/10 font-medium text-primary'
                                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-primary hover:text-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                    }`}
                            >
                                {t(`bodyType.${b}`)}
                            </button>
                        );
                    })}
                </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Año */}
            <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {t('filters.year')}
                </h3>
                <div className="flex items-center gap-2">
                    <RangeInput
                        key={`minYear:${range('minYear')}`}
                        name="minYear"
                        initial={range('minYear')}
                        placeholder={t('filters.yearFrom')}
                        onCommit={setParam}
                    />
                    <span className="text-slate-400">–</span>
                    <RangeInput
                        key={`maxYear:${range('maxYear')}`}
                        name="maxYear"
                        initial={range('maxYear')}
                        placeholder={t('filters.yearTo')}
                        onCommit={setParam}
                    />
                </div>
            </div>
        </div>
    );
}

export function SortSelect() {
    const t = useTranslations();
    const { sp, pathname, router, startTransition } = useFilterNav();
    const current = sp.get('sort') ?? 'recommended';

    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        const params = new URLSearchParams(sp.toString());
        if (value && value !== 'recommended') params.set('sort', value);
        else params.delete('sort');
        params.delete('page');
        const qs = params.toString();
        startTransition(() => {
            router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
        });
    };

    return (
        <label className="flex items-center gap-2">
            <span className="hidden text-sm text-slate-600 dark:text-slate-400 sm:inline">
                {t('list.sortBy')}
            </span>
            <select
                value={current}
                onChange={onChange}
                className="rounded-lg border-slate-200 bg-white py-2 pl-3 pr-8 text-sm focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
                <option value="recommended">{t('list.sortRecommended')}</option>
                <option value="price_asc">{t('list.sortPriceAsc')}</option>
                <option value="price_desc">{t('list.sortPriceDesc')}</option>
                <option value="newest">{t('list.sortNewest')}</option>
            </select>
        </label>
    );
}