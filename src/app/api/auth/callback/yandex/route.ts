import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin;

  if (error) {
    return NextResponse.redirect(new URL("/auth/signin?error=social_auth_failed", baseUrl));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/auth/signin?error=no_code", baseUrl));
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
      return NextResponse.redirect(new URL("/auth/signin?error=yandex_token_failed", baseUrl));
    }

    const userInfoResponse = await fetch("https://login.yandex.ru/info", {
      headers: { Authorization: `OAuth ${tokenData.access_token}` },
    });
    const userInfo = await userInfoResponse.json();

    if (!userInfo.id) {
      return NextResponse.redirect(new URL("/auth/signin?error=yandex_user_failed", baseUrl));
    }

    const yandexId = userInfo.id.toString();
    const email = userInfo.default_email;
    const name = userInfo.real_name || userInfo.display_name || "Yandex User";

    let user = await prisma.user.findFirst({
      where: {
        accounts: { some: { provider: "yandex", providerAccountId: yandexId } },
      },
    });

    if (!user) {
      const existing = email ? await prisma.user.findUnique({ where: { email } }) : null;
      const randomPassword = await bcrypt.hash(crypto.randomUUID(), 10);

      if (existing) {
        await prisma.account.create({
          data: {
            userId: existing.id,
            type: "oauth",
            provider: "yandex",
            providerAccountId: yandexId,
            access_token: tokenData.access_token,
          },
        });
        user = existing;
      } else {
        user = await prisma.user.create({
          data: {
            name,
            email: email || `yandex_${yandexId}@yandex.com`,
            password: randomPassword,
            image: userInfo.default_avatar_id
              ? `https://avatars.yandex.net/get-yapic/${userInfo.default_avatar_id}/islands-200`
              : undefined,
            role: "subscriber",
            accounts: {
              create: {
                type: "oauth",
                provider: "yandex",
                providerAccountId: yandexId,
                access_token: tokenData.access_token,
              },
            },
          },
        });
      }
    }

    return await signIn("credentials", {
      email: user.email,
      password: user.password!,
      redirect: true,
      redirectTo: "/dashboard",
    });
  } catch (err) {
    console.error("Yandex auth error:", err);
    return NextResponse.redirect(new URL("/auth/signin?error=social_auth_failed", baseUrl));
  }
}
