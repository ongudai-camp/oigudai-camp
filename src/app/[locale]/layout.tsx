import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getTranslations } from "next-intl/server";

const inter = Inter({ subsets: ["latin"] });

export function generateStaticParams() {
  return ["ru", "en", "tr"].map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: any): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale });
  return {
    title: `Ongudai Camp - ${t("nav.home")}`,
    description: t("common.welcome"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: any) {
  const { locale } = params;

  if (!["ru", "en", "tr"].includes(locale)) {
    const { notFound } = await import("next/navigation");
    notFound();
  }

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
