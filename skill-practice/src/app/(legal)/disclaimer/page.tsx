import { getTranslations } from "next-intl/server";

import { LegalPage } from "@/components/legal/LegalPage";
import { brand } from "@/lib/brand";
import type { Metadata } from "next";
import { useTranslations } from "next-intl";

export async function generateMetadata(): Promise<Metadata> {
  const tr = await getTranslations("ui");
  return {
    title: tr("disclaimer"),
  };
}

export default function DisclaimerPage() {
  const legal = useTranslations("legal");
  const tr = useTranslations("ui");
  return (
    <LegalPage
      title={tr("practiceDisclaimer")}
      description={legal("disclaimer.text1")}
      sections={[
        {
          title: legal("disclaimer.text2"),
          body: [
            legal("disclaimer.text3", { p0: brand.appName }),
            legal("disclaimer.text4"),
          ],
        },
        {
          title: legal("disclaimer.text5"),
          body: [
            legal("disclaimer.text6"),
            legal("disclaimer.text7"),
            legal("disclaimer.text8"),
          ],
        },
        {
          title: legal("disclaimer.text9"),
          body: [legal("disclaimer.text10"), legal("disclaimer.text11")],
        },
        {
          title: legal("disclaimer.text12"),
          body: [legal("disclaimer.text13"), legal("disclaimer.text14")],
        },
        {
          title: legal("disclaimer.text15"),
          body: [legal("disclaimer.text16")],
        },
        {
          title: legal("disclaimer.text17"),
          body: [legal("disclaimer.text18"), legal("disclaimer.text19")],
        },
        {
          title: legal("disclaimer.text20"),
          body: [legal("disclaimer.text21")],
        },
      ]}
    />
  );
}
