import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  icon: LucideIcon;
  title: string;
  right?: ReactNode;
};

export function SectionHeader({ icon: Icon, title, right }: Props) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-base font-medium">
        <Icon className="h-4 w-4" />
        {title}
      </h2>
      {right}
    </div>
  );
}
