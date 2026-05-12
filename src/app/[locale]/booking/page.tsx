import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import BookingForm from "@/components/hotels/BookingForm";
import SimpleBookingForm from "@/components/booking/SimpleBookingForm";
import { ArrowLeft, MapPin, Star } from "lucide-react";

interface BookingPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string; id?: string }>;
}

export default async function BookingPage({
  params,
  searchParams,
}: BookingPageProps) {
  const { locale } = await params;
  const { type, id } = await searchParams;

  if (!id || !type) notFound();

  const postId = parseInt(id);
  if (isNaN(postId)) notFound();

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { rooms: true },
  });

  if (!post) notFound();

  const typePath = type === "hotel" ? "hotels" : type === "tour" ? "tours" : "activities";

  return (
    <div className="min-h-screen bg-[#F0F9FF] py-6 md:py-12">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <Link
          href={"/" + locale + "/" + typePath + "/" + post.slug}
          className="inline-flex items-center gap-2 text-sky-500 hover:text-orange-500 font-bold text-sm transition-colors mb-6 group"
        >
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          Вернуться к {type === "hotel" ? "отелю" : type === "tour" ? "туру" : "активности"}
        </Link>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Form */}
          <div className="flex-1 lg:max-w-[480px]">
            {type === "hotel" ? (
              <BookingForm hotelId={post.id} rooms={post.rooms} />
            ) : (
              <SimpleBookingForm
                postId={post.id}
                type={type}
                price={post.salePrice || post.price}
                title={post.title}
              />
            )}
          </div>

          {/* Summary Sidebar */}
          <div className="flex-1 space-y-6">
            <div className="bg-white rounded-[2rem] shadow-xl border border-white/50 overflow-hidden backdrop-blur-sm">
              <div className="relative h-56 overflow-hidden">
                {post.featuredImage ? (
                  <Image
                    src={post.featuredImage}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-sky-100 to-sky-50 flex items-center justify-center">
                    <MapPin size={48} className="text-sky-200" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-5 left-6 right-6">
                  <h1 className="text-2xl font-black text-white mb-1">{post.title}</h1>
                  {post.address && (
                    <p className="text-white/80 text-sm flex items-center gap-2">
                      <MapPin size={14} />
                      {post.address}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-sky-300">Тип</span>
                  <span className="font-bold text-sm text-sky-950">
                    {type === "hotel" ? "Отель" : type === "tour" ? "Тур" : "Активность"}
                  </span>
                </div>
                {post.rating > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-sky-300">Рейтинг</span>
                    <span className="font-bold text-sm text-orange-500 flex items-center gap-1">
                      <Star size={14} className="fill-orange-500" /> {post.rating}
                    </span>
                  </div>
                )}
                {post.content && (
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-sky-300 block mb-2">Описание</span>
                    <p className="text-sm text-sky-700/70 line-clamp-3 leading-relaxed">{post.content}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
