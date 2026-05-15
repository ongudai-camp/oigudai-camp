'use client';

import { useTranslations } from 'next-intl';
import HeroSearchBar from './HeroSearchBar';

export default function Hero() {
  const t = useTranslations('hero');

  return (
    <section className='relative min-h-[90vh] flex items-center justify-center overflow-hidden'>
      {/* Background Image with Overlay */}
      <div 
        className='absolute inset-0 z-0'
        style={{
          backgroundImage: 'url(/hero-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className='absolute inset-0 bg-gradient-to-b from-sky-950/60 via-sky-950/40 to-sky-950/70'></div>
      </div>

      {/* Content */}
      <div className='container mx-auto px-4 relative z-10 text-center'>
        <h1 className='text-3xl sm:text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-lg leading-tight'>
          {t('title')} <br /> 
          <span className='text-orange-400'>{t('subtitle')}</span>
        </h1>
        <p className='text-base sm:text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto drop-shadow-md px-4'>
          {t('description')}
        </p>

        {/* Search Bar */}
        <div className='px-0 sm:px-8'>
          <HeroSearchBar />
        </div>
      </div>

      {/* Floating Elements */}
      <div className='absolute bottom-10 left-10 animate-bounce hidden lg:block'>
        <div className='bg-white/10 backdrop-blur-lg p-4 rounded-2xl border border-white/20 text-white text-sm'>
          ⭐ 4.9/5 {t('rating')}
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className='absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#F0F9FF] to-transparent'></div>
    </section>
  );
}
