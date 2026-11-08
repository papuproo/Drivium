import { Link } from "@/i18n/navigation";
import { RegisterForm } from "@/components/register-form";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function RegisterPage({
    params
}: {
    params: Promise<{ locale: string }>;
}) {

    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: 'auth' });

    return (
        <main className="flex min-h-screen items-center justify-center bg-background-light px-4 dark:bg-background-dark">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h1 className="mb-6 text-2x1 font-bold">{t('registerTitle')}</h1>
                <RegisterForm />
                <p className="mt-4 text-center text-sm text-slate-500">
                    {t('haveAccount')}{' '}
                    <Link href={"/login"} className="font-semibold text-primary">
                        {t('goLogin')}
                    </Link>
                </p>
            </div>
        </main>
    );
}