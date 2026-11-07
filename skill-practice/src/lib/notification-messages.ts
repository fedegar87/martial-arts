import { createTranslator } from "next-intl";
import messages from "./i18n/notifications.json" with { type: "json" };

export function notificationTranslator(locale: string) {
  const language = locale.startsWith("fr") ? "fr" : "it";
  return createTranslator({ locale: language, messages: messages[language] });
}
