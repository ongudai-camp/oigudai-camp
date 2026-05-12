'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  price: number;
  type: string;
}

export default function FeaturedSection({ type, titleKey }: { type: string; titleKey: string }) {
  const t = useTranslations('featured');
  const locale = useLocale();

  const { data, isLoading } = useQuery<Post[]>({
    queryKey: ['featured', type],
    queryFn: async () => {
      const res = await fetch(`/api/posts?type=${type}&limit=3&locale=${locale}`);
      if (!res.ok) throw new Error('Failed to fetch posts');
      const json = await res.json();
      return json.posts;
    },
  });

  if (isLoading) return <div className='h-96 animate-pulse bg-sky-100 rounded-3xl'></div>;

  return (
    <section className='py-20'>
      <div className='flex justify-between items-end mb-10'>
        <div>
          <h2 className='text-3xl font-bold text-sky-950 mb-2'>{t(titleKey)}</h2>
          <div className='h-1.5 w-20 bg-orange-500 rounded-full'></div>
        </div>
        <Link href={`/${locale}/${type}s`} className='text-sky-600 font-semibold hover:text-sky-800 transition-colors cursor-pointer'>
          {t('viewAll')} →
        </Link>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
        {data?.map((post) => (
          <Link 
            key={post.id} 
            href={`/${locale}/${type}s/${post.slug}`}
            className='group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-sky-50'
          >
            <div className='relative h-64 overflow-hidden'>
              <Image 
                src={post.featuredImage || '/images/image_default.jpg'} 
                alt={post.title}
                fill
                className='object-cover transition-transform duration-700 group-hover:scale-110'
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className='absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full font-bold text-sky-950'>
                {t('from')} {post.price} ₽
              </div>
            </div>
            <div className='p-6'>
              <h3 className='text-xl font-bold text-sky-950 mb-2 group-hover:text-sky-600 transition-colors'>{post.title}</h3>
              <p className='text-sky-600 text-sm line-clamp-2'>{post.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
