import { getRequestConfig } from "next-intl/server";

const LOCALES = ["ru", "en", "kk"] as const;
const DEFAULT_LOCALE = "ru";

export default getRequestConfig(async ({ locale }) => {
  const validLocale = locale && LOCALES.includes(locale as typeof LOCALES[number]) 
    ? locale as string 
    : DEFAULT_LOCALE;

  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default,
  };
});
