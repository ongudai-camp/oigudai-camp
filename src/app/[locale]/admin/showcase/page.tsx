'use client';

import { Player } from '@remotion/player';
import { HotelShowcase } from '@/remotion/templates/HotelShowcase';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function ShowcasePage() {
  const t = useTranslations('admin');
  const { data, isLoading } = useQuery({
    queryKey: ['showcase-hotels'],
    queryFn: async () => {
      const res = await fetch('/api/posts?type=hotel&limit=5');
      if (!res.ok) throw new Error('Failed to fetch hotels');
      const json = await res.json();
      return json.posts;
    },
  });

  const [selectedHotelIndex, setSelectedHotelIndex] = useState(0);

  if (isLoading) return <div className='p-8 animate-pulse'>{t('showcase.loading')}</div>;

  const hotels = data || [];
  const selectedHotel = hotels[selectedHotelIndex];

  return (
    <div className='p-8 space-y-8'>
      <div>
        <h1 className='text-3xl font-bold text-sky-950 mb-2'>{t('showcase.title')}</h1>
        <p className='text-sky-600'>{t('showcase.subtitle')}</p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Hotel List */}
        <div className='space-y-4'>
          <h2 className='font-bold text-sky-900 uppercase text-xs tracking-wider'>{t('showcase.yourObjects')}</h2>
          {hotels.map((hotel: { id: number; title: string; price: number }, index: number) => (
            <button
              key={hotel.id}
              onClick={() => setSelectedHotelIndex(index)}
              className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 ${
                selectedHotelIndex === index
                  ? 'bg-sky-600 border-sky-600 text-white shadow-lg shadow-sky-600/20'
                  : 'bg-white border-sky-100 text-sky-900 hover:border-sky-300'
              }`}
            >
              <div className='font-bold truncate'>{hotel.title}</div>
              <div className={`text-xs ${selectedHotelIndex === index ? 'text-sky-600' : 'text-sky-700'}`}>
                {hotel.price} ₽ {t('showcase.perNight')}
              </div>
            </button>
          ))}
        </div>

        {/* Video Player */}
        <div className='lg:col-span-2'>
          {selectedHotel && (
            <div className='bg-white rounded-3xl shadow-xl overflow-hidden border border-sky-50'>
              <Player
                component={HotelShowcase}
                durationInFrames={150}
                compositionWidth={1920}
                compositionHeight={1080}
                fps={30}
                controls
                style={{
                  width: '100%',
                  aspectRatio: '16/9',
                }}
                inputProps={{
                  title: selectedHotel.title,
                  price: selectedHotel.price,
                  image: selectedHotel.featuredImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80',
                  rating: selectedHotel.rating || 5.0,
                }}
              />
              <div className='p-8 flex items-center justify-between'>
                <div>
                  <h3 className='font-bold text-sky-950 text-xl'>{t('showcase.readyToRender')}</h3>
                  <p className='text-sky-600 text-sm'>{t('showcase.videoInfo')}</p>
                </div>
                <button className='bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-orange-500/30 transition-all duration-300 transform hover:scale-105 cursor-pointer'>
                  {t('showcase.downloadMp4')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
