'use client';

import { Player } from '@remotion/player';
import { HotelShowcase } from '@/remotion/templates/HotelShowcase';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

export default function ShowcasePage() {
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

  if (isLoading) return <div className='p-8 animate-pulse'>Загрузка отелей...</div>;

  const hotels = data || [];
  const selectedHotel = hotels[selectedHotelIndex];

  return (
    <div className='p-8 space-y-8'>
      <div>
        <h1 className='text-3xl font-bold text-sky-950 mb-2'>Генератор видео-презентаций</h1>
        <p className='text-sky-600'>Выберите объект для создания рекламного ролика</p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Hotel List */}
        <div className='space-y-4'>
          <h2 className='font-bold text-sky-900 uppercase text-xs tracking-wider'>Ваши объекты</h2>
          {// eslint-disable-next-line @typescript-eslint/no-explicit-any
          hotels.map((hotel: any, index: number) => (
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
              <div className={`text-xs ${selectedHotelIndex === index ? 'text-sky-100' : 'text-sky-500'}`}>
                {hotel.price} ₽ / ночь
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
                  <h3 className='font-bold text-sky-950 text-xl'>Готово к рендеру</h3>
                  <p className='text-sky-600 text-sm'>Full HD (1080p) • 30 FPS • 5 секунд</p>
                </div>
                <button className='bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-orange-500/30 transition-all duration-300 transform hover:scale-105 cursor-pointer'>
                  Скачать MP4
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
