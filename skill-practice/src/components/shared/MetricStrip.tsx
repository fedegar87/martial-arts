import type { ReactNode } from "react";

type Metric = {
  label: string;
  value: ReactNode;
};

type Props = {
  metrics: Metric[];
};

export function MetricStrip({ metrics }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {metrics.map((metric) => (
        <div key={metric.label} className="surface-inset rounded-md p-3">
          <div className="font-mono text-xl font-semibold leading-none">
            {metric.value}
          </div>
          <div className="label-font text-muted-foreground mt-1 text-[0.68rem]">
            {metric.label}
          </div>
        </div>
      ))}
    </div>
  );
}
