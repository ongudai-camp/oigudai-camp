import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");
  const first_name = searchParams.get("first_name");
  const last_name = searchParams.get("last_name");
  const username = searchParams.get("username");
  const photo_url = searchParams.get("photo_url");
  const hash = searchParams.get("hash");
  const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin;

  if (!id || !hash) {
    return NextResponse.redirect(new URL("/auth/signin?error=telegram_auth_failed", baseUrl));
  }

  try {
    const name = [first_name, last_name].filter(Boolean).join(" ") || `tg_${id}`;
    const email = `${username || `tg_${id}`}@telegram.com`;

    let user = await prisma.user.findFirst({
      where: {
        accounts: { some: { provider: "telegram", providerAccountId: id } },
      },
    });

    if (!user) {
      const randomPassword = await bcrypt.hash(crypto.randomUUID(), 10);
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: randomPassword,
          image: photo_url,
          role: "subscriber",
          accounts: {
            create: {
              type: "oauth",
              provider: "telegram",
              providerAccountId: id,
            },
          },
        },
      });
    }

    return await signIn("credentials", {
      email: user.email,
      password: user.password!,
      redirect: true,
      redirectTo: "/dashboard",
    });
  } catch (err) {
    console.error("Telegram auth error:", err);
    return NextResponse.redirect(new URL("/auth/signin?error=social_auth_failed", baseUrl));
  }
}
