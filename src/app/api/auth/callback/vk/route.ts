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
      return NextResponse.redirect(new URL("/auth/signin?error=vk_token_failed", baseUrl));
    }

    const userInfoResponse = await fetch(
      `https://api.vk.com/method/users.get?access_token=${tokenData.access_token}&v=5.131&fields=photo_200`
    );
    const userInfo = await userInfoResponse.json();

    if (!userInfo.response || !userInfo.response[0]) {
      return NextResponse.redirect(new URL("/auth/signin?error=vk_user_failed", baseUrl));
    }

    const vkUser = userInfo.response[0];
    const vkId = tokenData.user_id?.toString();
    const email = tokenData.email;
    const name = [vkUser.first_name, vkUser.last_name].filter(Boolean).join(" ");

    let user = await prisma.user.findFirst({
      where: {
        accounts: { some: { provider: "vk", providerAccountId: vkId } },
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
            provider: "vk",
            providerAccountId: vkId,
            access_token: tokenData.access_token,
          },
        });
        user = existing;
      } else {
        user = await prisma.user.create({
          data: {
            name,
            email: email || `vk_${vkId}@vk.com`,
            password: randomPassword,
            role: "subscriber",
            accounts: {
              create: {
                type: "oauth",
                provider: "vk",
                providerAccountId: vkId,
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
    console.error("VK auth error:", err);
    return NextResponse.redirect(new URL("/auth/signin?error=social_auth_failed", baseUrl));
  }
}
