import { Flame, RefreshCw, type LucideIcon } from "lucide-react";
import type { PlanStatus } from "@/lib/types";

type PlanStatusVisual = {
  label: string;
  Icon: LucideIcon;
  badgeClassName: string;
  dotClassName: string;
  textClassName: string;
  mapClassName: string;
};

export const PLAN_STATUS_VISUALS: Record<PlanStatus, PlanStatusVisual> = {
  focus: {
    label: "Focus",
    Icon: Flame,
    badgeClassName: "border-primary/50 bg-primary/10 text-primary",
    dotClassName: "bg-primary",
    textClassName: "text-primary",
    mapClassName: "bg-primary",
  },
  maintenance: {
    label: "Mantenimento",
    Icon: RefreshCw,
    badgeClassName:
      "border-[color:var(--status-info)]/50 bg-[color:var(--status-info)]/10 text-[var(--status-info)]",
    dotClassName: "bg-[var(--status-info)]",
    textClassName: "text-[var(--status-info)]",
    mapClassName: "bg-[var(--status-info)]",
  },
};

export const CURRICULUM_MARKER_VISUALS = {
  available: {
    label: "Accessibile",
    mapClassName: "bg-muted-foreground/25",
  },
  locked: {
    label: "Bloccata",
    mapClassName: "bg-muted opacity-40",
  },
};
