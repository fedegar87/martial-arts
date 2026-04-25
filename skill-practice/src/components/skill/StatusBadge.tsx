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
    className: "bg-primary text-primary-foreground border-transparent",
  },
  review: {
    label: "Ripasso",
    Icon: Repeat,
    className: "bg-amber-600 text-white border-transparent",
  },
  maintenance: {
    label: "Mantenimento",
    Icon: Wrench,
    className: "bg-muted text-foreground border-transparent",
  },
};

export function StatusBadge({ status }: { status: PlanStatus }) {
  const { label, Icon, className } = STATUS_CONFIG[status];
  return (
    <Badge className={className}>
      <Icon className="mr-1 h-3 w-3" />
      {label}
    </Badge>
  );
}
