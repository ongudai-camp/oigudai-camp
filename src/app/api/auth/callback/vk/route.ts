import { NextRequest, NextResponse } from "next/server";
import { signIn } from "next-auth/react";

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
    const tokenResponse = await fetch("https://oauth.vk.com/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.VK_CLIENT_ID!,
        client_secret: process.env.VK_CLIENT_SECRET!,
        code: code,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/vk`,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("VK token error:", tokenData);
      return NextResponse.redirect(new URL("/auth/signin?error=vk_token_failed", request.url));
    }

    const userInfoResponse = await fetch(
      `https://api.vk.com/method/users.get?access_token=${tokenData.access_token}&v=5.131&fields=photo_200`
    );
    const userInfo = await userInfoResponse.json();

    if (!userInfo.response || !userInfo.response[0]) {
      return NextResponse.redirect(new URL("/auth/signin?error=vk_user_failed", request.url));
    }

    const vkUser = userInfo.response[0];

    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (err) {
    console.error("VK auth error:", err);
    return NextResponse.redirect(new URL("/auth/signin?error=social_auth_failed", request.url));
  }
}
