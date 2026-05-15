interface BookingEvent {
  id: number;
  bookingId: string;
  userId: number;
  status: string;
  totalPrice: number;
  post?: { title: string } | null;
  user?: { email: string | null; name: string | null; phone: string | null } | null;
}

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const isDev = () => !RESEND_API_KEY || RESEND_API_KEY === "your-resend-api-key";

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (isDev()) {
    console.log(`[DEV EMAIL] To: ${to}, Subject: ${subject}`);
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Ongudai Camp <noreply@ongudaicamp.ru>",
        to,
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("[EMAIL] Failed to send:", err);
    }
  } catch (error) {
    console.error("[EMAIL] Error:", error);
  }
}

export async function notifyBookingCreated(booking: BookingEvent): Promise<void> {
  console.log(`[NOTIFY] Booking created: ${booking.bookingId}`, {
    user: booking.userId,
    status: booking.status,
    amount: booking.totalPrice,
  });

  const email = booking.user?.email;
  if (!email) return;

  await sendEmail(
    email,
    `Бронирование #${booking.bookingId} — подтверждение`,
    `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#0C4A6E;">Бронирование создано</h2>
        <p>Здравствуйте${booking.user?.name ? `, ${booking.user.name}` : ""}!</p>
        <p>Ваше бронирование <strong>#${booking.bookingId}</strong> создано.</p>
        <p>Статус: <strong>${booking.status}</strong></p>
        <p>Сумма: <strong>${booking.totalPrice.toLocaleString()} ₽</strong></p>
        ${booking.post?.title ? `<p>Объект: ${booking.post.title}</p>` : ""}
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
        <p style="color:#64748b;font-size:12px;">Ongudai Camp — отдых на Алтае</p>
      </div>
    `,
  );
}

export async function notifyBookingStatusChanged(
  booking: BookingEvent,
  oldStatus: string,
): Promise<void> {
  console.log(`[NOTIFY] Booking ${booking.bookingId} status changed: ${oldStatus} → ${booking.status}`, {
    user: booking.userId,
  });

  const email = booking.user?.email;
  if (!email) return;

  await sendEmail(
    email,
    `Бронирование #${booking.bookingId} — статус изменён`,
    `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#0C4A6E;">Статус бронирования изменён</h2>
        <p>Здравствуйте${booking.user?.name ? `, ${booking.user.name}` : ""}!</p>
        <p>Статус вашего бронирования <strong>#${booking.bookingId}</strong> изменён.</p>
        <p>Было: <strong>${oldStatus}</strong></p>
        <p>Стало: <strong>${booking.status}</strong></p>
        ${booking.post?.title ? `<p>Объект: ${booking.post.title}</p>` : ""}
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
        <p style="color:#64748b;font-size:12px;">Ongudai Camp — отдых на Алтае</p>
      </div>
    `,
  );
}

export async function notifyAdminNewBooking(booking: BookingEvent): Promise<void> {
  if (isDev()) {
    console.log(`[DEV ADMIN NOTIFY] New booking: ${booking.bookingId}`);
    return;
  }
  console.log(`[ADMIN NOTIFY] New booking: ${booking.bookingId} — amount: ${booking.totalPrice} ₽`);
}
