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
import { Toaster } from "sonner";

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
    title: {
      default: "Ongudai Camp — отдых в Онгудайском районе Алтая",
      template: "%s | Ongudai Camp",
    },
    description: t("common.welcome") || "Отели, туры и активный отдых в Онгудайском районе Республики Алтай. Бронирование жилья, экскурсий и развлечений.",
    keywords: ["Онгудай", "Алтай", "отдых", "отели", "туры", "экскурсии", "Ongudai", "Altai"],
    metadataBase: new URL("https://ongudaicamp.ru"),
    openGraph: {
      title: "Ongudai Camp — отдых на Алтае",
      description: "Отели, туры и активный отдых в Онгудайском районе Республики Алтай",
      url: "https://ongudaicamp.ru",
      siteName: "Ongudai Camp",
      locale: locale === "ru" ? "ru_RU" : locale === "kk" ? "kk_KZ" : "en_US",
      type: "website",
      images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Ongudai Camp — отдых на Алтае",
      description: "Отели, туры и активный отдых в Онгудайском районе",
    },
    robots: { index: true, follow: true },
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
            <Toaster position="top-center" richColors />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
