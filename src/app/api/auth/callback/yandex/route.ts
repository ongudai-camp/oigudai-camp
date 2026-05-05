import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL("/auth/signin?error=social_auth_failed", request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/auth/signin?error=no_code", request.url));
  }

  try {
    const tokenResponse = await fetch("https://oauth.yandex.ru/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: code,
        client_id: process.env.YANDEX_CLIENT_ID!,
        client_secret: process.env.YANDEX_CLIENT_SECRET!,
        grant_type: "authorization_code",
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/yandex`,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      console.error("Yandex token error:", tokenData);
      return NextResponse.redirect(new URL("/auth/signin?error=yandex_token_failed", request.url));
    }

    const userInfoResponse = await fetch("https://login.yandex.ru/info", {
      headers: { Authorization: `OAuth ${tokenData.access_token}` },
    });
    const userInfo = await userInfoResponse.json();

    if (!userInfo.id) {
      return NextResponse.redirect(new URL("/auth/signin?error=yandex_user_failed", request.url));
    }

    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (err) {
    console.error("Yandex auth error:", err);
    return NextResponse.redirect(new URL("/auth/signin?error=social_auth_failed", request.url));
  }
}
