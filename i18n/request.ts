import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ locale }) => {
  const validLocale = ["ru", "en", "tr"].includes(locale as string) ? locale as string : "ru";

  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default,
  };
});
