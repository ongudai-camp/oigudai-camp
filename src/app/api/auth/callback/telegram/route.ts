import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");
  const first_name = searchParams.get("first_name");
  const last_name = searchParams.get("last_name");
  const photo_url = searchParams.get("photo_url");
  const auth_date = searchParams.get("auth_date");
  const hash = searchParams.get("hash");

  if (!id || !hash) {
    return NextResponse.redirect(new URL("/auth/signin?error=telegram_auth_failed", request.url));
  }

  try {
    const telegramUser = {
      id,
      first_name,
      last_name,
      photo_url,
      auth_date,
    };

    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (err) {
    console.error("Telegram auth error:", err);
    return NextResponse.redirect(new URL("/auth/signin?error=social_auth_failed", request.url));
  }
}
