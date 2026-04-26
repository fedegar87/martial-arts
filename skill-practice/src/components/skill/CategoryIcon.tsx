import {
  Circle,
  Dumbbell,
  Footprints,
  Hand,
  Shield,
  Swords,
  Users,
  Wind,
  type LucideIcon,
} from "lucide-react";
import type { SkillCategory } from "@/lib/types";

const ICONS: Record<SkillCategory, LucideIcon> = {
  forme: Circle,
  tui_fa: Footprints,
  po_chi: Shield,
  chin_na: Hand,
  armi_forma: Swords,
  armi_combattimento: Swords,
  tue_shou: Users,
  ta_lu: Circle,
  chi_kung: Wind,
  preparatori: Dumbbell,
};

export function CategoryIcon({
  category,
  className,
}: {
  category?: SkillCategory;
  className?: string;
}) {
  const Icon = category ? ICONS[category] : Circle;
  return <Icon className={className} aria-hidden="true" />;
}
