import { LoginForm } from '@/components/login-form';
import { Link } from '@/i18n/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export default async function LoginPage({
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
                <h1 className="mb-6 text-2xl font-bold">{t('loginTitle')}</h1>
                <LoginForm />
                <p className='mt-4 text-center text-sm text-slate-500'>
                    {t('noAccount')}{' '}
                    <Link href="/register" className='font-semibold text-primary'>
                        {t('goRegister')}
                    </Link>
                </p>
            </div>
        </main>
    );
}