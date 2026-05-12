const SMS_RU_API_KEY = process.env.SMS_RU_API_KEY;

interface SmsResult {
  success: boolean;
  error?: string;
}

export async function sendSms(phone: string, message: string): Promise<SmsResult> {
  if (!SMS_RU_API_KEY || SMS_RU_API_KEY === "your-sms-ru-api-key") {
    console.log(`[DEV SMS] To: ${phone}, Message: ${message}`);
    return { success: true };
  }

  try {
    const params = new URLSearchParams({
      api_id: SMS_RU_API_KEY,
      to: phone,
      msg: message,
      json: "1",
    });

    const res = await fetch(`https://sms.ru/sms/send?${params}`);
    const data = await res.json() as Record<string, unknown>;

    if (data.status === "OK") {
      return { success: true };
    }

    return { success: false, error: String(data.status_text ?? "Unknown error") };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
