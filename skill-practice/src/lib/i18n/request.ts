import { APP_TIME_ZONE } from "@/lib/date";
import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { LOCALE_COOKIE, resolveLocale } from "./config";
import italian from "./it.json";
import legalItalian from "./legal-it.json";

export default getRequestConfig(async () => {
  const [store, requestHeaders] = await Promise.all([cookies(), headers()]);
  const locale = resolveLocale(
    store.get(LOCALE_COOKIE)?.value,
    requestHeaders.get("accept-language"),
  );
  const selected = (await import(`./${locale}.json`)).default;
  return {
    locale,
    timeZone: APP_TIME_ZONE,
    messages: { ui: { ...italian.ui, ...selected.ui }, legal: legalItalian },
  };
});
