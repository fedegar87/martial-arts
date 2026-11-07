import { getTranslations } from "next-intl/server";

import { LegalPage } from "@/components/legal/LegalPage";
import type { Metadata } from "next";
import { useTranslations } from "next-intl";

export async function generateMetadata(): Promise<Metadata> {
  const tr = await getTranslations("ui");
  return {
    title: tr("cookies"),
  };
}

export default function CookiesPage() {
  const legal = useTranslations("legal");
  const tr = useTranslations("ui");
  return (
    <LegalPage
      title={tr("cookies")}
      description={legal("cookies.text1")}
      sections={[
        {
          title: legal("cookies.text2"),
          body: [
            legal("cookies.text3"),
            legal("cookies.text4"),
            legal("cookies.text5"),
            legal("cookies.text6"),
            legal("cookies.localeCookie"),
          ],
        },
        {
          title: legal("cookies.text7"),
          body: [legal("cookies.text8"), legal("cookies.text9")],
        },
        {
          title: legal("cookies.text10"),
          body: [
            legal("cookies.text11"),
            legal("cookies.text12"),
            legal("cookies.text13"),
          ],
        },
        {
          title: legal("cookies.text14"),
          body: [
            legal("cookies.text15"),
            legal("cookies.text16"),
            legal("cookies.text17"),
          ],
        },
        {
          title: legal("cookies.text18"),
          body: [
            legal("cookies.text19"),
            legal("cookies.text20"),
            legal("cookies.text21"),
            legal("cookies.text22"),
          ],
        },
        {
          title: legal("cookies.text23"),
          body: [
            legal("cookies.text24"),
            legal("cookies.text25"),
            legal("cookies.text26"),
          ],
        },
        {
          title: legal("cookies.text27"),
          body: [
            legal("cookies.text28"),
            legal("cookies.text29"),
            legal("cookies.text30"),
            legal("cookies.text31"),
          ],
        },
      ]}
    />
  );
}
