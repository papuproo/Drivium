import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { SellForm } from "@/components/sell-form";

export default async function SellPage({
    params
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const session = await auth();
    if (!session) redirect(`/${locale}/login`);

    const t = await getTranslations('sell');
    return (
        <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 dark:text-white md:text-4xl">
                    {t('title')}
                </h1>
                <p className="mt-2 text-base text-slate-500 md:text-lg">
                    {t('subtitle')}
                </p>
            </div>
            <SellForm />
        </main>
    );
}