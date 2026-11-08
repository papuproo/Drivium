'use client';

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { loginAction } from "@/lib/actions/auth";

const field = 'rounded-lg border-slate-200 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800';

export function LoginForm() {
    const t = useTranslations('auth');
    const locale = useLocale();
    const [state, formAction, pending] = useActionState(loginAction, null);

    return (
        <form action={formAction} className="flex flex-col gap-4">
            <input type="hidden" name="locale" value={locale} />
            <label className="flex flex-col gap-1 text-sm font-medium">
                Correo
                <input name="email" type="email" required className="rounded-lg border-slate-200 focus:border-primary focus:ring-primary  dark:bg-slate-700 dark:border-slate-800" />
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium">
                Contraseña
                <input name="password" type="password" required className="rounded-lg border-slate-200 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800" />
            </label>
            {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
            <button
                type="submit"
                disabled={pending}
                className="mt-2 rounded-lg bg-primary py-2.5 font-bold text-white transition-all hover:bg-primary-dark disabled:opacity-60"
            >
                {pending ? 'Entrando...' : 'Iniciar sesion'}
            </button>
        </form>
    )
}