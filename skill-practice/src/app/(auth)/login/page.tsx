import { safeRedirectPath } from "@/lib/auth-validation";
import type { UiTranslator } from "@/lib/i18n/config";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "./LoginForm";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const tr = await getTranslations("ui");
  const params = await searchParams;

  return (
    <LoginForm
      initialError={errorMessage(tr, params.error)}
      next={safeRedirectPath(params.next) ?? undefined}
    />
  );
}

function errorMessage(
  tr: UiTranslator,
  code: string | undefined,
): string | null {
  if (code === "link_invalid") {
    return tr("expiredPasswordLink");
  }

  return null;
}
