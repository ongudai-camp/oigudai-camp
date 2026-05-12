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
    const tokenResponse = await fetch("https://api.sberbank.ru/auth/oauth/v2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.SBER_CLIENT_ID!,
        client_secret: process.env.SBER_CLIENT_SECRET!,
        grant_type: "authorization_code",
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/sber`,
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      console.error("SberID token error:", tokenData);
      return NextResponse.redirect(new URL("/auth/signin?error=sber_token_failed", baseUrl));
    }

    const userInfoResponse = await fetch("https://api.sberbank.ru/auth/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userInfo = await userInfoResponse.json();

    if (!userInfo.sub) {
      return NextResponse.redirect(new URL("/auth/signin?error=sber_user_failed", baseUrl));
    }

    const sberId = userInfo.sub;
    const name = userInfo.name || userInfo.given_name || "Sber User";
    const email = userInfo.email || userInfo.phone || `sber_${sberId}@sberbank.ru`;

    let user = await prisma.user.findFirst({
      where: {
        accounts: { some: { provider: "sber", providerAccountId: sberId } },
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
            provider: "sber",
            providerAccountId: sberId,
            access_token: tokenData.access_token,
          },
        });
        user = existing;
      } else {
        user = await prisma.user.create({
          data: {
            name,
            email,
            password: randomPassword,
            role: "subscriber",
            phone: userInfo.phone || null,
            accounts: {
              create: {
                type: "oauth",
                provider: "sber",
                providerAccountId: sberId,
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
    console.error("SberID auth error:", err);
    return NextResponse.redirect(new URL("/auth/signin?error=social_auth_failed", baseUrl));
  }
}
