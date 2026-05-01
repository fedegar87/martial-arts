import type { PlanStatus } from "@/lib/types";

type PlanStatusVisual = {
  label: string;
  badgeClassName: string;
  dotClassName: string;
  textClassName: string;
  mapClassName: string;
};

export const PLAN_STATUS_VISUALS: Record<PlanStatus, PlanStatusVisual> = {
  focus: {
    label: "Focus",
    badgeClassName: "border-primary bg-transparent text-primary",
    dotClassName: "bg-primary",
    textClassName: "text-primary",
    mapClassName: "bg-primary",
  },
  review: {
    label: "Ripasso",
    badgeClassName:
      "border-[color:var(--status-warning)] bg-transparent text-[var(--status-warning)]",
    dotClassName: "bg-[var(--status-warning)]",
    textClassName: "text-[var(--status-warning)]",
    mapClassName: "bg-[var(--status-warning)]",
  },
  maintenance: {
    label: "Mantenimento",
    badgeClassName:
      "border-[color:var(--status-info)] bg-transparent text-[var(--status-info)]",
    dotClassName: "bg-[var(--status-info)]",
    textClassName: "text-[var(--status-info)]",
    mapClassName: "bg-[var(--status-info)]",
  },
};

export const COMPLETION_VISUALS = {
  done: {
    label: "Fatto oggi",
    className:
      "border-[color:var(--status-success)] bg-transparent text-[var(--status-success)]",
  },
  pending: {
    label: "Da fare",
    className: "border-border bg-transparent text-muted-foreground",
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
