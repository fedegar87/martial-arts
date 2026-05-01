import { CheckCircle2, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { COMPLETION_VISUALS } from "@/lib/marker-visuals";

type Props = {
  completed: boolean;
};

export function PracticeCompletionBadge({ completed }: Props) {
  const visual = completed ? COMPLETION_VISUALS.done : COMPLETION_VISUALS.pending;
  const Icon = completed ? CheckCircle2 : Circle;

  return (
    <Badge variant="outline" className={visual.className}>
      <Icon className="mr-1 h-3 w-3" />
      {visual.label}
    </Badge>
  );
}
