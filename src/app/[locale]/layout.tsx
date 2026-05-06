import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getTranslations } from "next-intl/server";
import Providers from "@/providers/TanstackProvider";

const inter = Inter({ subsets: ["latin"] });

export function generateStaticParams() {
  return ["ru", "en", "tr"].map((locale) => ({ locale }));
}

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

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
