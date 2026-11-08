'use client'

import { useActionState } from "react";
import { useLocale } from 'next-intl';
import { registerAction } from "@/lib/actions/auth";

export function RegisterForm() {
    const locale = useLocale();
    const [state, formAction, pending] = useActionState(registerAction, null);

    // Creamos una constante con los estilos de los campos del formulario en lugar de crear componentes.
    const field = 'rounded-lg border-slate-200 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800';
    return (
        <form action={formAction} className="flex flex-col gap-3">
            <input type="hidden" name="locale" value={locale} />
            <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1 text-sm font-medium">
                    Nombre
                    <input name="firstName" required className={field} />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium">
                    Apellido
                    <input name="lastName" required className={field} />
                </label>
            </div>
            <label className="flex flex-col gap-1 text-sm font-medium">
                Correo
                <input name="email" type="email" required minLength={6} className={field} />
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium">
                Contraseña
                <input name="password" type="password" required minLength={6} className={field} />
            </label>
            {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
            <button
                type="submit"
                disabled={pending}
                className="mt-2 rounded-lg bg-primary py-2.5 font-bold text-white transition-all hover:bg-primary-dark disabled:opacity-60"
            >
                {pending ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
        </form>
    );
}