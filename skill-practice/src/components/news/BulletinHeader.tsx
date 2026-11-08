import { SegmentedNav } from "@/components/primitives/SegmentedNav";
import { useTranslations } from "next-intl";

export function BulletinHeader({
  active,
}: {
  active: "communications" | "calendar";
}) {
  const tr = useTranslations("ui");
  return (
    <header className="space-y-4">
      <h1 className="text-2xl font-semibold">{tr("news")}</h1>
      <SegmentedNav
        ariaLabel={tr("news")}
        fullWidth
        items={[
          {
            href: "/news",
            label: tr("announcements"),
            active: active === "communications",
          },
          {
            href: "/calendar",
            label: tr("calendar"),
            active: active === "calendar",
          },
        ]}
      />
    </header>
  );
}
