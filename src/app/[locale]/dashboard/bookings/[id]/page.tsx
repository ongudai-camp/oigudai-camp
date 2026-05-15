import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ru, enUS, kk } from "date-fns/locale";
import { getTranslations } from "next-intl/server";
import CancelBookingButton from "@/components/booking/CancelBookingButton";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const session = await auth();
  const t = await getTranslations({ locale, namespace: "dashboard" });

  if (!session?.user) {
    redirect("/" + locale + "/auth/signin");
  }

  const userId = parseInt(session.user.id);
  const bookingId = parseInt(id);
  if (isNaN(bookingId)) redirect("/" + locale + "/dashboard");

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { post: true, room: true, user: true },
  });

  if (!booking || booking.userId !== userId) {
    redirect("/" + locale + "/dashboard");
  }

  const dateLocale = locale === "ru" ? ru : locale === "kk" ? kk : enUS;
  const addons = booking.addons ? JSON.parse(booking.addons) : [];

  const statusColors: Record<string, string> = {
    confirmed: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    cancelled: "bg-red-100 text-red-800",
    completed: "bg-blue-100 text-blue-800",
  };

  const paymentColors: Record<string, string> = {
    paid: "bg-green-100 text-green-800",
    unpaid: "bg-yellow-100 text-yellow-800",
    refunded: "bg-red-100 text-red-800",
  };

  const canCancel = booking.status === "pending" || booking.status === "confirmed";

  return (
    <>
        <Link
          href={"/" + locale + "/dashboard"}
          className="inline-flex items-center gap-2 text-sky-700 hover:text-orange-500 font-bold text-sm transition-colors mb-6 group"
        >
          &larr; {t("backToDashboard") || "Назад в дашборд"}
        </Link>

        <div className="bg-white rounded-2xl shadow-xl border border-white/50 p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-black text-sky-950">{t("bookingDetail") || "Детали бронирования"}</h1>
              <p className="text-sky-700 text-sm mt-1 font-mono">{booking.bookingId}</p>
            </div>
            <div className="flex gap-2">
              <span className={"px-4 py-2 text-sm rounded-full font-bold " + (statusColors[booking.status] || "bg-gray-100")}>
                {booking.status}
              </span>
              <span className={"px-4 py-2 text-sm rounded-full font-bold " + (paymentColors[booking.paymentStatus] || "bg-gray-100")}>
                {booking.paymentStatus}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-sky-600 mb-1">{t("property") || "Объект"}</h3>
              <p className="font-bold text-lg text-sky-950">{booking.post.title}</p>
            </div>
            {booking.room && (
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-sky-600 mb-1">{t("room") || "Номер"}</h3>
                <p className="font-bold text-sky-950">{booking.room.title}</p>
              </div>
            )}
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-sky-600 mb-1">{t("checkIn") || "Заезд"}</h3>
              <p className="font-bold text-sky-950">{format(new Date(booking.checkIn), "dd MMM yyyy", { locale: dateLocale })}</p>
            </div>
            {booking.checkOut && (
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-sky-600 mb-1">{t("checkOut") || "Выезд"}</h3>
                <p className="font-bold text-sky-950">{format(new Date(booking.checkOut), "dd MMM yyyy", { locale: dateLocale })}</p>
              </div>
            )}
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-sky-600 mb-1">{t("guests") || "Гости"}</h3>
              <p className="font-bold text-sky-950">{booking.guests}</p>
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-sky-600 mb-1">{t("totalPrice") || "Сумма"}</h3>
              <p className="font-black text-3xl text-orange-500">{booking.totalPrice.toLocaleString()} {booking.currency}</p>
            </div>
          </div>

          {/* Guest Details */}
          <div className="mt-6 pt-6 border-t border-sky-100">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-sky-600 mb-3">Guest details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {booking.user?.name && (
                <div>
                  <span className="text-gray-400 block text-xs">Name</span>
                  <span className="font-bold text-gray-900">{booking.user.name}</span>
                </div>
              )}
              {booking.guestEmail && (
                <div>
                  <span className="text-gray-400 block text-xs">Email</span>
                  <span className="font-bold text-gray-900">{booking.guestEmail}</span>
                </div>
              )}
              {booking.guestPhone && (
                <div>
                  <span className="text-gray-400 block text-xs">Phone</span>
                  <span className="font-bold text-gray-900">{booking.guestPhone}</span>
                </div>
              )}
            </div>
            {booking.specialRequests && (
              <div className="mt-3">
                <span className="text-gray-400 block text-xs">Special requests</span>
                <p className="font-medium text-gray-700 mt-1 bg-gray-50 rounded-xl p-3">{booking.specialRequests}</p>
              </div>
            )}
          </div>

          {/* Addons */}
          {addons.length > 0 && (
            <div className="mt-4 pt-4 border-t border-sky-100">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-sky-600 mb-2">Extra services</h3>
              <div className="space-y-1.5">
                {addons.map((a: { id: number; title: string; price: number }) => (
                  <div key={a.id} className="flex items-center justify-between text-sm bg-gray-50 rounded-xl px-4 py-2.5">
                    <span className="font-medium text-gray-700">{a.title}</span>
                    <span className="font-bold text-gray-900">+{a.price.toLocaleString()} ₽</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Promo Code */}
          {booking.promoCode && (
            <div className="mt-4 pt-4 border-t border-sky-100">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-sky-600 mb-1">Promo code</h3>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-bold text-emerald-600">{booking.promoCode}</span>
                {booking.discountAmount && booking.discountAmount > 0 && (
                  <span className="text-emerald-500">(-{booking.discountAmount.toLocaleString()} ₽)</span>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-sky-100 flex items-center justify-between">
            <p className="text-sm text-sky-700 font-medium">
              Created: {format(new Date(booking.createdAt), "dd MMM yyyy HH:mm", { locale: dateLocale })}
            </p>
            {canCancel && (
              <CancelBookingButton bookingId={booking.id} locale={locale} />
            )}
          </div>
        </div>
    </>
  );
}
