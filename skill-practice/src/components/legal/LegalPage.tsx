import { LegalLinks } from "@/components/legal/LegalLinks";
import { LocaleSwitcher } from "@/components/shared/LocaleSwitcher";
import { useTranslations } from "next-intl";
import Link from "next/link";

type Section = {
  title: string;
  body: string[];
};

type Props = {
  title: string;
  description: string;
  sections: Section[];
};

export function LegalPage({ title, description, sections }: Props) {
  const tr = useTranslations("ui");
  return (
    <main className="bg-background min-h-dvh px-4 py-8 text-foreground">
      <article className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-3">
          <div className="flex justify-end">
            <LocaleSwitcher />
          </div>
          <Link
            href="/"
            className="text-muted-foreground text-sm hover:underline"
          >
            {tr("backApp")}
          </Link>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold">{title}</h1>
            <p lang="it" className="text-muted-foreground text-sm">
              {description}
            </p>
            {tr("locale").startsWith("fr") && (
              <p className="rounded-md border border-border p-3 text-sm">
                {tr("legalOriginalLanguage")}
              </p>
            )}
            <p className="text-muted-foreground text-xs">{tr("legalDraft")}</p>
            <p className="text-muted-foreground text-xs">
              {tr("legalDraftNotice")}
            </p>
          </div>
          <LegalLinks />
        </header>

        <div lang="it" className="space-y-6">
          {sections.map((section) => (
            <section key={section.title} className="space-y-2">
              <h2 className="text-lg font-medium">{section.title}</h2>
              {section.body.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-muted-foreground text-sm leading-6"
                >
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
