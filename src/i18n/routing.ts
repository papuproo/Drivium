import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
    locales: ['es', 'en'],
    defaultLocale: 'es'
});

export function safeLocale(value: FormDataEntryValue | null) {
    const v = String(value ?? '');
    return (routing.locales as readonly string[]).includes(v)
        ? (v as (typeof routing.locales)[number])
        : routing.defaultLocale;
}