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
    className: "border-muted-foreground bg-transparent text-muted-foreground",
  },
  maintenance: {
    label: "Mantenimento",
    Icon: Wrench,
    className: "border-green-700 bg-transparent text-green-500",
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
