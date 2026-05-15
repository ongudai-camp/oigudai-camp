interface YooKassaPayment {
  id: string;
  status: string;
  amount: { value: string; currency: string };
  confirmation: { confirmation_url: string };
  metadata?: Record<string, string>;
}

const YOOKASSA_SHOP_ID = process.env.YOOKASSA_SHOP_ID || "";
const YOOKASSA_SECRET_KEY = process.env.YOOKASSA_SECRET_KEY || "";

const isDev = () => !YOOKASSA_SHOP_ID || YOOKASSA_SHOP_ID === "your-shop-id";

export async function createPayment(amount: number, bookingId: string, description: string): Promise<{ paymentUrl: string | null; paymentId: string | null; error?: string }> {
  if (isDev()) {
    console.log(`[DEV PAYMENT] Booking ${bookingId}: ${amount} RUB — ${description}`);
    return {
      paymentUrl: null,
      paymentId: `dev_${Date.now()}`,
    };
  }

  try {
    const auth = Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString("base64");
    const body = {
      amount: { value: amount.toFixed(2), currency: "RUB" },
      confirmation: { type: "redirect", return_url: process.env.NEXTAUTH_URL + "/dashboard/bookings/" + bookingId.split("-")[1] },
      capture: true,
      description,
      metadata: { bookingId },
    };

    const res = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
        "Idempotence-Key": `bk_${bookingId}_${Date.now()}`,
      },
      body: JSON.stringify(body),
    });

    const data = (await res.json()) as YooKassaPayment;

    if (!res.ok) {
      return { paymentUrl: null, paymentId: null, error: `YooKassa error: ${(data as unknown as Record<string, string>).description || res.statusText}` };
    }

    return {
      paymentUrl: data.confirmation?.confirmation_url || null,
      paymentId: data.id,
    };
  } catch (error) {
    return { paymentUrl: null, paymentId: null, error: String(error) };
  }
}

export async function getPaymentStatus(paymentId: string): Promise<{ status: string; error?: string }> {
  if (isDev()) {
    return { status: "succeeded" };
  }

  try {
    const auth = Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString("base64");
    const res = await fetch(`https://api.yookassa.ru/v3/payments/${paymentId}`, {
      headers: { Authorization: `Basic ${auth}` },
    });

    const data = (await res.json()) as YooKassaPayment;

    if (!res.ok) {
      return { status: "failed", error: `YooKassa error: ${(data as unknown as Record<string, string>).description || res.statusText}` };
    }

    return { status: data.status };
  } catch (error) {
    return { status: "failed", error: String(error) };
  }
}

export async function refundPayment(paymentId: string, amount: number): Promise<{ success: boolean; error?: string }> {
  if (isDev()) {
    console.log(`[DEV REFUND] Payment ${paymentId}: ${amount} RUB`);
    return { success: true };
  }

  try {
    const auth = Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString("base64");
    const body = {
      payment_id: paymentId,
      amount: { value: amount.toFixed(2), currency: "RUB" },
    };

    const res = await fetch("https://api.yookassa.ru/v3/refunds", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
        "Idempotence-Key": `ref_${paymentId}_${Date.now()}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      return { success: false, error: `YooKassa refund error: ${(data as unknown as Record<string, string>).description || res.statusText}` };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
