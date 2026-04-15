'use client';

import { useLumina } from '@continuouslabs/lumina-react';

export default function Home() {
  const { locale, setLocale } = useLumina()

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start text-center sm:text-left">
        <h1 t className="text-4xl font-bold tracking-tight text-balance sm:text-6xl">
          Zero-Config i18n
        </h1>
        
        <p t className="text-lg text-gray-500 max-w-[600px]">
          This is a Next.js App Router application showcasing Lumina's seamless translation extraction and dual-package architecture.
        </p>

        <div className="flex gap-4 items-center flex-col sm:flex-row mt-4">
          <button 
            onClick={() => setLocale('en')}
            className={`rounded-full border border-solid transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 ${locale === 'en' ? 'opacity-50 pointer-events-none' : ''}`}
          >
            English
          </button>
          
          <button
            onClick={() => setLocale('es')}
            className={`rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44 ${locale === 'es' ? 'opacity-50 pointer-events-none' : ''}`}
          >
            Español
          </button>
        </div>
      </main>
    </div>
  );
}
