import { localizedBrand } from "@/lib/brand";

import type { UiTranslator } from "@/lib/i18n/config";
import {
  BarChart3,
  Bell,
  BookOpenText,
  CalendarDays,
  Target,
  User,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { HubTile } from "./HubTile";

function HUB_AREAS(tr: UiTranslator) {
  return [
    {
      href: "/today",
      Icon: CalendarDays,
      title: tr("training"),
      subtitle: tr("dailyPractice"),
      anim: "hub-anim-tile-1",
    },
    {
      href: "/programma",
      Icon: Target,
      title: tr("program"),
      subtitle: tr("examsAndStudy"),
      anim: "hub-anim-tile-2",
    },
    {
      href: "/library",
      Icon: BookOpenText,
      title: localizedBrand(tr("locale")).lineageLabel,
      subtitle: tr("techniquesAndForms"),
      anim: "hub-anim-tile-3",
    },
    {
      href: "/progress",
      Icon: BarChart3,
      title: tr("progressPlural"),
      subtitle: tr("practiceHistory"),
      anim: "hub-anim-tile-4",
    },
    {
      href: "/news",
      Icon: Bell,
      title: tr("news"),
      subtitle: tr("schoolNews"),
      anim: "hub-anim-tile-5",
    },
    {
      href: "/profile",
      Icon: User,
      title: tr("profile"),
      subtitle: tr("profileDescription"),
      anim: "hub-anim-tile-6",
    },
  ];
}

export function HubGrid() {
  const tr = useTranslations("ui");
  return (
    <div className="hub-grid">
      {HUB_AREAS(tr).map(({ href, Icon, title, subtitle, anim }) => (
        <HubTile
          key={href}
          href={href}
          Icon={Icon}
          title={title}
          subtitle={subtitle}
          animClassName={anim}
        />
      ))}
    </div>
  );
}
