import { VehicleFilters, SortSelect } from '@/components/vehicle-filters';
import { Suspense } from 'react';

export default async function PruebaPage() {
    return (
        <main className="mx-auto max-w-[1600px] px-4 py-8 md:px-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-[18rem_1fr]">
                <aside className="md:sticky md:top-24 md:self-start">
                    <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                        <VehicleFilters />
                    </div>
                </aside>
            </div>
        </main>
    );
}