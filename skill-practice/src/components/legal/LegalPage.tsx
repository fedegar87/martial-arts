import Link from "next/link";
import { LegalLinks } from "@/components/legal/LegalLinks";

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
  return (
    <main className="bg-background min-h-dvh px-4 py-8 text-foreground">
      <article className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-3">
          <Link href="/" className="text-muted-foreground text-sm hover:underline">
            Torna all&apos;app
          </Link>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold">{title}</h1>
            <p className="text-muted-foreground text-sm">{description}</p>
            <p className="text-muted-foreground text-xs">
              Bozza prodotto aggiornata al 3 maggio 2026. Da revisionare con un
              consulente legale prima della pubblicazione definitiva.
            </p>
            <p className="text-muted-foreground text-xs">
              I campi marcati [PLACEHOLDER] devono essere completati dal
              titolare, dalla scuola o dal referente privacy prima del rilascio.
            </p>
          </div>
          <LegalLinks />
        </header>

        <div className="space-y-6">
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
