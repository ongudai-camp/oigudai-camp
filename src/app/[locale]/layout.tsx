import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import HydrationFix from "@/components/HydrationFix";
import Footer from "@/components/layout/Footer";
import ChatWidget from "@/components/chat/ChatWidget";
import { getTranslations, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import Providers from "@/providers/TanstackProvider";
import { auth } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

export function generateStaticParams() {
  return ["ru", "en", "kk"].map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return {
    title: `Ongudai Camp - ${t("nav.home")}`,
    description: t("common.welcome"),
  };
}

export default async function LocaleLayout({ 
  children, 
  params 
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const messages = await getMessages({ locale });
  const session = await auth();
  const userId = session?.user?.id ? parseInt(session.user.id) : null;

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <HydrationFix />
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Providers>
            <Navbar />
            <main className="pb-16 lg:pb-0">{children}</main>
            <Footer />
            <BottomNav />
            <ChatWidget userId={userId} locale={locale} />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
