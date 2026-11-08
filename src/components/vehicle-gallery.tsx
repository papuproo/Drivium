'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { VehicleImageDTO } from '@/lib/vehicles';

export function VehicleGallery({
    images,
    title
}: {
    images: VehicleImageDTO[];
    title: string;
}) {
    const [index, setIndex] = useState(0);
    const active = images[index] ?? images[0];

    return (
        <section className="flex flex-col gap-4">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100 shadow-sm dark:bg-slate-800 md:aspect-video">
                <Image
                    src={active.url}
                    alt={active.alt || title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    className="object-cover"
                />
                {images.length > 1 && (
                    <div className="absolute bottom-4 right-4 flex items-center gap-1 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                        <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                        {index + 1}/{images.length}
                    </div>
                )}
            </div>

            {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => setIndex(idx)}
                            aria-label={`${title} — ${idx + 1}`}
                            className={`h-24 w-32 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${idx === index
                                    ? 'border-primary ring-2 ring-primary/20'
                                    : 'border-transparent opacity-70 hover:opacity-100'
                                }`}
                        >
                            <Image
                                src={img.url}
                                alt={img.alt || title}
                                width={128}
                                height={96}
                                className="h-full w-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </section>
    );
}