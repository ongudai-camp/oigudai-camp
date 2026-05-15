import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { isAdmin } from "@/lib/adminAccess";
import ChatInterface from "@/components/chat/ChatInterface";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/auth/signin`);
  }

  const userId = parseInt(session.user.id);
  const isAdminUser = isAdmin(session.user.role);

  return (
    <>
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-white/50 overflow-hidden flex-1 min-h-[calc(100vh-16rem)] lg:min-h-[calc(100vh-12rem)]">
        <ChatInterface userId={userId} isAdmin={false} />
      </div>
    </>
  );
}
