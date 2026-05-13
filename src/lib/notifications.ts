interface BookingEvent {
  id: number;
  bookingId: string;
  userId: number;
  status: string;
  totalPrice: number;
  post?: { title: string } | null;
}

export async function notifyBookingCreated(booking: BookingEvent): Promise<void> {
  console.log(`[NOTIFY] Booking created: ${booking.bookingId}`, {
    user: booking.userId,
    status: booking.status,
    amount: booking.totalPrice,
  });
}

export async function notifyBookingStatusChanged(
  booking: BookingEvent,
  oldStatus: string,
): Promise<void> {
  console.log(`[NOTIFY] Booking ${booking.bookingId} status changed: ${oldStatus} → ${booking.status}`, {
    user: booking.userId,
  });
}
