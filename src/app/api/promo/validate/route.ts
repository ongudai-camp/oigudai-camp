import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, total } = body;

    if (!code) {
      return NextResponse.json({ valid: false, message: "Code is required" });
    }

    const promo = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promo || !promo.active) {
      return NextResponse.json({ valid: false, message: "Invalid promo code" });
    }

    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      return NextResponse.json({ valid: false, message: "Promo code has expired" });
    }

    if (promo.maxUses && promo.usedCount >= promo.maxUses) {
      return NextResponse.json({ valid: false, message: "Promo code usage limit reached" });
    }

    if (promo.minAmount && total < promo.minAmount) {
      return NextResponse.json({ valid: false, message: `Minimum order amount: ${promo.minAmount} ₽` });
    }

    let discountAmount = 0;
    if (promo.discountType === "percent") {
      discountAmount = Math.round(total * (promo.discountValue / 100));
    } else {
      discountAmount = promo.discountValue;
    }

    // Cap discount at total price
    discountAmount = Math.min(discountAmount, total);

    await prisma.promoCode.update({
      where: { id: promo.id },
      data: { usedCount: { increment: 1 } },
    });

    return NextResponse.json({
      valid: true,
      discountAmount,
      discountType: promo.discountType,
      code: promo.code,
    });
  } catch {
    return NextResponse.json({ valid: false, message: "Error validating code" });
  }
}
