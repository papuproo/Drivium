'use client';

import { useActionState, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { createVehicleAction } from "@/lib/actions/vehicle";
import { BODY_TYPES, CONDITIONS, FUEL_TYPES, TRANSMISSIONS } from "@/lib/enums";

const DOORS = [2, 3, 4, 5] as const;

const field = 'w-full rounded-lg border-slate-200 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white';
const labelCls = 'flex flex-col gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200';

function Section({
    n,
    title,
    tinted,
    children
}: {
    n: number,
    title: string,
    tinted?: boolean,
    children: React.ReactNode
}) {
    return (
        <div className={`border-b border-slate-100 p-6 dark:border-slate-800 md:p-8 ${tinted ? 'bg-slate-50/50 dark:bg-slate-800/30' : ''}`}>
            <div className="mb-6 flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {n}
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {title}
                </h2>
            </div>
            {children}
        </div>
    );
}

export function SellForm() {
    const t = useTranslations('sell');
    const tCondition = useTranslations('condition');
    const tBody = useTranslations('bodyType');
    const tFuel = useTranslations('fuel');
    const tTrans = useTranslations('transmission');
    const locale = useLocale();

    const [state, formAction, pending] = useActionState(createVehicleAction, null);
    const [imageUrls, setImageUrls] = useState<string[]>(['']);

    const errorMessage =
        state?.error === 'server' ? t('errorServer') : state?.error ? t('errorGeneric') : null;

    return (
        <form
            action={formAction}
            className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
            <input type="hidden" name="locale" value={locale} />

            {/* 1. Detalles del vehículo */}
            <Section n={1} title={t('sectionVehicle')}>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <label className={labelCls}>
                        {t('brand')}
                        <input name="make" required placeholder={t('brandPlaceholder')} className={field} />
                    </label>
                    <label className={labelCls}>
                        {t('model')}
                        <input name="model" required placeholder={t('modelPlaceholder')} className={field} />
                    </label>
                    <label className={labelCls}>
                        {t('trim')}
                        <input name="trim" placeholder={t('trimPlaceholder')} className={field} />
                    </label>
                    <label className={labelCls}>
                        {t('year')}
                        <input
                            name="year"
                            type="number"
                            required
                            min={1900}
                            placeholder={t('yearPlaceholder')}
                            className={field}
                        />
                    </label>
                    <label className={labelCls}>
                        {t('mileage')}
                        <input
                            name="mileage"
                            inputMode="numeric"
                            required
                            placeholder={t('mileagePlaceholder')}
                            className={field}
                        />
                    </label>
                    <label className={labelCls}>
                        {t('condition')}
                        <select name="condition" required defaultValue="" className={field}>
                            <option value="" disabled>
                                {t('select')}
                            </option>
                            {CONDITIONS.map((c) => (
                                <option key={c} value={c}>
                                    {tCondition(c)}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className={labelCls}>
                        {t('bodyType')}
                        <select name="bodyType" required defaultValue="" className={field}>
                            <option value="" disabled>
                                {t('select')}
                            </option>
                            {BODY_TYPES.map((b) => (
                                <option key={b} value={b}>
                                    {tBody(b)}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className={`${labelCls} md:col-span-2`}>
                        {t('description')}
                        <textarea
                            name="description"
                            rows={4}
                            placeholder={t('descriptionPlaceholder')}
                            className={`${field} resize-y`}
                        />
                    </label>
                </div>
            </Section>

            {/* 2. Fotos (URLs por ahora) */}
            <Section n={2} title={t('sectionPhotos')} tinted>
                <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {t('images')}
                    </span>
                    <p className="mb-1 text-xs text-slate-400">{t('imagesHint')}</p>
                    <div className="flex flex-col gap-3">
                        {imageUrls.map((url, i) => (
                            <div key={i} className="flex gap-2">
                                <input
                                    type="url"
                                    name="imageUrl"
                                    value={url}
                                    onChange={(e) =>
                                        setImageUrls((prev) =>
                                            prev.map((v, j) => (j === i ? e.target.value : v))
                                        )
                                    }
                                    placeholder={t('imageUrlPlaceholder')}
                                    className={field}
                                />
                                {imageUrls.length > 1 && (
                                    <button
                                        type="button"
                                        aria-label={t('removeImage')}
                                        onClick={() =>
                                            setImageUrls((prev) => prev.filter((_, j) => j !== i))
                                        }
                                        className="flex shrink-0 items-center rounded-lg px-3 text-slate-400 transition-colors hover:text-red-500"
                                    >
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={() => setImageUrls((prev) => [...prev, ''])}
                        className="mt-1 self-start text-sm font-semibold text-primary transition-colors hover:text-primary-dark"
                    >
                        + {t('addImage')}
                    </button>
                </div>
            </Section>

            {/* 3. Especificaciones técnicas */}
            <Section n={3} title={t('sectionSpecs')}>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <label className={labelCls}>
                        {t('transmission')}
                        <select name="transmission" required defaultValue="" className={field}>
                            <option value="" disabled>
                                {t('select')}
                            </option>
                            {TRANSMISSIONS.map((tr) => (
                                <option key={tr} value={tr}>
                                    {tTrans(tr)}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className={labelCls}>
                        {t('fuelType')}
                        <select name="fuelType" required defaultValue="" className={field}>
                            <option value="" disabled>
                                {t('select')}
                            </option>
                            {FUEL_TYPES.map((f) => (
                                <option key={f} value={f}>
                                    {tFuel(f)}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className={labelCls}>
                        {t('doors')}
                        <select name="doors" defaultValue="" className={field}>
                            <option value="">{t('select')}</option>
                            {DOORS.map((n) => (
                                <option key={n} value={n}>
                                    {n}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className={labelCls}>
                        {t('exteriorColor')}
                        <input
                            name="exteriorColor"
                            placeholder={t('exteriorColorPlaceholder')}
                            className={field}
                        />
                    </label>
                    <label className={labelCls}>
                        {t('interiorColor')}
                        <input
                            name="interiorColor"
                            placeholder={t('interiorColorPlaceholder')}
                            className={field}
                        />
                    </label>
                </div>
            </Section>

            {/* 4. Ubicación */}
            <Section n={4} title={t('sectionLocation')} tinted>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-6">
                    <label className={`${labelCls} sm:col-span-3`}>
                        {t('city')}
                        <input name="city" required placeholder={t('cityPlaceholder')} className={field} />
                    </label>
                    <label className={`${labelCls} sm:col-span-2`}>
                        {t('state')}
                        <input name="state" required placeholder={t('statePlaceholder')} className={field} />
                    </label>
                    <label className={`${labelCls} sm:col-span-1`}>
                        {t('zip')}
                        <input name="zip" placeholder={t('zipPlaceholder')} className={field} />
                    </label>
                </div>
            </Section>

            {/* 5. Precio */}
            <Section n={5} title={t('sectionPricing')}>
                <label className={`${labelCls} max-w-md`}>
                    {t('askingPrice')}
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-medium text-slate-400">
                            $
                        </span>
                        <input
                            name="price"
                            inputMode="decimal"
                            required
                            placeholder="0"
                            className={`${field} h-14 pl-9 text-2xl font-bold`}
                        />
                    </div>
                </label>
            </Section>

            {/* Footer / acciones */}
            <div className="flex items-center justify-end gap-4 bg-slate-50 p-6 dark:bg-slate-800/40 md:p-8">
                {errorMessage && <p className="mr-auto text-sm text-red-500">{errorMessage}</p>}
                <button
                    type="submit"
                    disabled={pending}
                    className="flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-8 text-sm font-bold text-white shadow-md transition-all hover:bg-primary-dark disabled:opacity-60"
                >
                    <span>{pending ? t('submitting') : t('submit')}</span>
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
            </div>
        </form>
    );
}