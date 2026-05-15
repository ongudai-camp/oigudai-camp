import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAccess";

const IS_AI_CONFIGURED = !!(
  process.env.OPENAI_API_KEY &&
  process.env.OPENAI_API_KEY !== "your-openai-api-key"
);

export async function GET() {
  try {
    await requireAdmin();

    const setting = await prisma.setting.findUnique({ where: { key: "ai_chat_enabled" } });
    const dbEnabled = setting ? setting.value === "true" : null;
    const envEnabled = process.env.AI_CHAT_ENABLED === "true";

    return NextResponse.json({
      configured: IS_AI_CONFIGURED,
      envEnabled,
      dbEnabled,
      enabled: dbEnabled ?? envEnabled,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { enabled } = body;

    if (typeof enabled !== "boolean") {
      return NextResponse.json({ error: "enabled must be a boolean" }, { status: 400 });
    }

    await prisma.setting.upsert({
      where: { key: "ai_chat_enabled" },
      update: { value: String(enabled) },
      create: { key: "ai_chat_enabled", value: String(enabled) },
    });

    return NextResponse.json({ success: true, enabled });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update settings" },
      { status: 500 }
    );
  }
}
