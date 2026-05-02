import {
  BarChart3,
  BookOpenText,
  CalendarDays,
  Megaphone,
  Target,
  User,
} from "lucide-react";
import { HubTile } from "./HubTile";

const HUB_AREAS = [
  {
    href: "/today",
    Icon: CalendarDays,
    title: "Allenamento",
    subtitle: "la tua pratica del giorno",
    anim: "hub-anim-tile-1",
  },
  {
    href: "/programma",
    Icon: Target,
    title: "Programma",
    subtitle: "esami e modalità di studio",
    anim: "hub-anim-tile-2",
  },
  {
    href: "/library",
    Icon: BookOpenText,
    title: "Scuola Chang",
    subtitle: "tecniche e forme",
    anim: "hub-anim-tile-3",
  },
  {
    href: "/progress",
    Icon: BarChart3,
    title: "Progressi",
    subtitle: "cosa hai praticato",
    anim: "hub-anim-tile-4",
  },
  {
    href: "/news",
    Icon: Megaphone,
    title: "Bacheca",
    subtitle: "comunicazioni della scuola",
    anim: "hub-anim-tile-5",
  },
  {
    href: "/profile",
    Icon: User,
    title: "Profilo",
    subtitle: "livello, esame, settings",
    anim: "hub-anim-tile-6",
  },
];

export function HubGrid() {
  return (
    <div className="hub-grid">
      {HUB_AREAS.map(({ href, Icon, title, subtitle, anim }) => (
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
