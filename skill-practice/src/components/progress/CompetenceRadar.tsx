import { Radar } from "lucide-react";
import { SectionHeader } from "@/components/progress/SectionHeader";

type Axis = {
  label: string;
  percent: number;
};

type Props = {
  axes: Axis[];
};

export function CompetenceRadar({ axes }: Props) {
  const normalized = axes.slice(0, 5);
  while (normalized.length < 5) {
    normalized.push({ label: "-", percent: 0 });
  }

  const points = normalized
    .map((axis, index) => point(index, axis.percent))
    .map((p) => `${p.x},${p.y}`)
    .join(" ");

  return (
    <section className="space-y-4 rounded-lg border p-4">
      <SectionHeader icon={Radar} title="Bilanciamento competenze" />
      <svg viewBox="0 0 220 180" className="mx-auto h-44 w-full max-w-xs">
        {[25, 50, 75, 100].map((value) => (
          <polygon
            key={value}
            points={normalized
              .map((_, index) => point(index, value))
              .map((p) => `${p.x},${p.y}`)
              .join(" ")}
            fill="none"
            stroke="currentColor"
            className="text-border"
          />
        ))}
        <polygon
          points={points}
          className="fill-primary/30 stroke-primary"
          strokeWidth="2"
        />
        {normalized.map((axis, index) => {
          const labelPoint = point(index, 118);
          return (
            <text
              key={`${axis.label}-${index}`}
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor="middle"
              className="fill-muted-foreground text-[10px]"
            >
              {axis.label}
            </text>
          );
        })}
      </svg>
      <div className="space-y-2">
        {normalized.map((axis, index) => (
          <div key={`${axis.label}-${index}`} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{axis.label}</span>
              <span className="text-muted-foreground">{axis.percent}%</span>
            </div>
            <div className="bg-muted h-2 rounded-full">
              <div
                className="bg-primary h-2 rounded-full"
                style={{ width: `${axis.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function point(index: number, percent: number) {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / 5;
  const radius = (percent / 100) * 70;
  return {
    x: 110 + Math.cos(angle) * radius,
    y: 90 + Math.sin(angle) * radius,
  };
}
