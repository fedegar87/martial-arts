import { Badge } from "@/components/ui/badge";
import type { PlanStatus } from "@/lib/types";
import { Flame, Repeat, Wrench } from "lucide-react";

const STATUS_CONFIG: Record<
  PlanStatus,
  { label: string; Icon: typeof Flame; className: string }
> = {
  focus: {
    label: "Focus",
    Icon: Flame,
    className: "border-primary bg-transparent text-primary",
  },
  review: {
    label: "Ripasso",
    Icon: Repeat,
    className: "border-[color:var(--status-warning)] bg-transparent text-[var(--status-warning)]",
  },
  maintenance: {
    label: "Mantenimento",
    Icon: Wrench,
    className: "border-[color:var(--status-success)] bg-transparent text-[var(--status-success)]",
  },
};

export function StatusBadge({ status }: { status: PlanStatus }) {
  const { label, Icon, className } = STATUS_CONFIG[status];
  return (
    <Badge className={`label-font ${className}`}>
      <Icon className="mr-1 h-3 w-3" />
      {label}
    </Badge>
  );
}
