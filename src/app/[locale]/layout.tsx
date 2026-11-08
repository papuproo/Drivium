import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import '../globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
    title: 'AutoMarket',
    description: 'Compra, vende y publica automóviles de forma simple y segura.'
};

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
        notFound();
    }

    setRequestLocale(locale);
    const messages = await getMessages();
    return (
        <html lang={locale} className={inter.variable} suppressHydrationWarning>
            <head>
                {/* Material Symbols para todo el sitio: este es el layout raíz (App Router),
                    así que la regla, pensada para pages/_document.js, no aplica aquí. */}
                {/* eslint-disable-next-line @next/next/no-page-custom-font */}
                <link rel='stylesheet' href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" />
            </head>
            <body className='bg-background-light font-display text-slate-900 antialiased dark:bg-background-dark dark:text-slate-100'>
                <NextIntlClientProvider messages={messages}>
                    <Navbar />
                    {children}
                </NextIntlClientProvider>
            </body>
        </html>
    );
}