import { getTranslations } from "next-intl/server";

import { LegalPage } from "@/components/legal/LegalPage";
import { brand } from "@/lib/brand";
import type { Metadata } from "next";
import { useTranslations } from "next-intl";

export async function generateMetadata(): Promise<Metadata> {
  const tr = await getTranslations("ui");
  return {
    title: tr("privacy"),
  };
}

export default function PrivacyPage() {
  const legal = useTranslations("legal");
  const tr = useTranslations("ui");
  return (
    <LegalPage
      title={tr("privacy")}
      description={legal("privacy.text1", { p0: brand.appName })}
      sections={[
        {
          title: legal("privacy.text2"),
          body: [
            legal("privacy.text3", {
              p0: brand.appName,
              p1: brand.federationName,
            }),
            legal("privacy.text4"),
            legal("privacy.text5"),
          ],
        },
        {
          title: legal("privacy.text6"),
          body: [
            legal("privacy.text7"),
            legal("privacy.text8"),
            legal("privacy.text9"),
            legal("privacy.text10"),
          ],
        },
        {
          title: legal("privacy.text11"),
          body: [
            legal("privacy.text12"),
            legal("privacy.text13"),
            legal("privacy.text14"),
          ],
        },
        {
          title: legal("privacy.text15"),
          body: [
            legal("privacy.text16"),
            legal("privacy.text17"),
            legal("privacy.text18"),
          ],
        },
        {
          title: legal("privacy.text19"),
          body: [
            legal("privacy.text20"),
            legal("privacy.text21"),
            legal("privacy.text22"),
            legal("privacy.text23"),
            legal("privacy.text24"),
          ],
        },
        {
          title: legal("privacy.text25"),
          body: [
            legal("privacy.text26"),
            legal("privacy.text27"),
            legal("privacy.text28"),
          ],
        },
        {
          title: legal("privacy.text29"),
          body: [
            legal("privacy.text30"),
            legal("privacy.text31"),
            legal("privacy.text32"),
            legal("privacy.text33"),
          ],
        },
        {
          title: legal("privacy.text34"),
          body: [
            legal("privacy.text35"),
            legal("privacy.text36"),
            legal("privacy.text37"),
          ],
        },
      ]}
    />
  );
}
