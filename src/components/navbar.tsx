import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { auth, signOut } from '@/lib/auth';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { Suspense } from 'react';

export async function Navbar() {
    const t = await getTranslations('nav');
    const locale = await getLocale();
    const session = await auth();

    const links = [
        { href: '/vehicles', label: t('vehicles') },
        { href: '/sell', label: t('sell') },
        { href: '/research', label: t('research') },
        { href: '/about', label: t('about') }
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-background-dark/80">
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
                <div className="flex items-center gap-10">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-3xl text-primary">directions_car</span>
                        <span className="text-xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-white">
                            Trideal
                        </span>
                    </Link>

                    <nav className="hidden items-center gap-8 md:flex">
                        {links.map((link) => (
                            <Link key={link.href} href={link.href} className="text-sm font-semibold transition-colors hover:text-primary">
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <Suspense fallback={null}><LocaleSwitcher /></Suspense>

                    {session?.user ? (
                        <>
                            <Link href="/saved" aria-label={t('saved')} className='flex items-center gap-1 text-sm font-bold text-slate-700 transition-colors hover:text-primary dark:text-slate-300'>
                                <span className='material-symbols-outlined text-[20px]'>bookmark</span>
                                <span className='hidden lg:inline'>{t('saved')}</span>
                            </Link>
                            <Link href="/dashboard" className="text-sm font-bold text-slate-700 transition-colors hover:text-primary dark:text-slate-300">
                                {session.user.name}
                            </Link>
                            <form
                                action={async () => {
                                    'use server';
                                    await signOut({ redirectTo: `/${locale}/login` });
                                }}
                            >
                                <button className="rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark">
                                    {t('logout')}
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="hidden px-5 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:text-primary dark:text-slate-300 sm:block">
                                {t('login')}
                            </Link>
                            <Link href="/register" className="rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark">
                                {t('register')}
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}