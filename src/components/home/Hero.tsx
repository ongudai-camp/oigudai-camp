'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

export default function Hero() {
  const t = useTranslations('hero');
  const locale = useLocale();

  return (
    <section className='relative h-[80vh] flex items-center justify-center overflow-hidden'>
      {/* Background Image with Overlay */}
      <div 
        className='absolute inset-0 z-0'
        style={{
          backgroundImage: 'url(/hero-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className='absolute inset-0 bg-sky-950/40 backdrop-blur-[2px]'></div>
      </div>

      {/* Content */}
      <div className='container mx-auto px-4 relative z-10 text-center'>
        <h1 className='text-3xl sm:text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg leading-tight'>
          {t('title')} <br /> 
          <span className='text-sky-400'>{t('subtitle')}</span>
        </h1>
        <p className='text-base sm:text-xl md:text-2xl text-sky-50 mb-10 max-w-2xl mx-auto drop-shadow-md px-4'>
          {t('description')}
        </p>
        
        <div className='flex flex-col sm:flex-row gap-4 justify-center px-4'>
          <Link 
            href={`/${locale}/hotels`} 
            className='bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-orange-500/50 cursor-pointer'
          >
            {t('cta_hotels')}
          </Link>
          <Link 
            href={`/${locale}/tours`} 
            className='bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/30 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 cursor-pointer'
          >
            {t('cta_tours')}
          </Link>
        </div>
      </div>

      {/* Floating Elements (SaaS UI Master: Motion-Driven) */}
      <div className='absolute bottom-10 left-10 animate-bounce hidden lg:block'>
        <div className='bg-white/10 backdrop-blur-lg p-4 rounded-2xl border border-white/20 text-white text-sm'>
          ⭐ 4.9/5 {t('rating')}
        </div>
      </div>
    </section>
  );
}
