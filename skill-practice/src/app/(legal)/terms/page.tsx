import { getTranslations } from "next-intl/server";

import { localizedBrand } from "@/lib/brand";

import { LegalPage } from "@/components/legal/LegalPage";
import { brand } from "@/lib/brand";
import type { Metadata } from "next";
import { useTranslations } from "next-intl";

export async function generateMetadata(): Promise<Metadata> {
  const tr = await getTranslations("ui");
  return {
    title: tr("terms"),
  };
}

export default function TermsPage() {
  const legal = useTranslations("legal");
  const tr = useTranslations("ui");
  return (
    <LegalPage
      title={tr("terms")}
      description={legal("terms.text1")}
      sections={[
        {
          title: legal("terms.text2"),
          body: [
            legal("terms.text3", {
              p0: brand.appName,
              p1: brand.federationName,
            }),
            legal("terms.text4", { p0: brand.appName }),
            legal("terms.text5"),
          ],
        },
        {
          title: tr("account"),
          body: [
            legal("terms.text6"),
            legal("terms.text7"),
            legal("terms.text8"),
            legal("terms.text9"),
          ],
        },
        {
          title: legal("terms.text10"),
          body: [
            legal("terms.text11"),
            legal("terms.text12"),
            legal("terms.text13", {
              p0: localizedBrand(tr("locale")).lineageLabel,
            }),
          ],
        },
        {
          title: legal("terms.text14"),
          body: [legal("terms.text15"), legal("terms.text16")],
        },
        {
          title: legal("terms.text17"),
          body: [
            legal("terms.text18"),
            legal("terms.text19"),
            legal("terms.text20"),
          ],
        },
        {
          title: legal("terms.text21"),
          body: [
            legal("terms.text22"),
            legal("terms.text23"),
            legal("terms.text24"),
          ],
        },
        {
          title: legal("terms.text25"),
          body: [
            legal("terms.text26"),
            legal("terms.text27"),
            legal("terms.text28"),
          ],
        },
        {
          title: legal("terms.text29"),
          body: [
            legal("terms.text30"),
            legal("terms.text31"),
            legal("terms.text32"),
          ],
        },
      ]}
    />
  );
}
