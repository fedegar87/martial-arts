import {
  CheckCircle2,
  Circle,
  Clock3,
  ListChecks,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  SessionPeriodProgress,
  SessionProgressRow,
  SessionProgressStatus,
} from "@/lib/session-progress";

type Props = {
  summary: SessionPeriodProgress;
  periodLabel: string;
};

export function SessionPeriodSummary({ summary, periodLabel }: Props) {
  return (
    <section className="space-y-4 rounded-lg border border-border bg-card p-4 shadow-[var(--shadow-sm)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <ListChecks className="h-4 w-4" />
            Riepilogo periodo
          </h2>
          <p className="text-muted-foreground text-sm capitalize">{periodLabel}</p>
        </div>
        <Badge variant="outline">{summary.completionPercent}%</Badge>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        <SummaryStat
          label="Sessioni"
          value={`${summary.sessionCompleted}/${summary.sessionTotal}`}
        />
        <SummaryStat
          label="Esercizi"
          value={`${summary.exerciseCompleted}/${summary.exerciseTotal}`}
        />
        <SummaryStat
          label="Rip. forme"
          value={`${summary.repsDone}/${summary.repsTarget}`}
        />
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
        <div
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${summary.completionPercent}%` }}
        />
      </div>

      {summary.rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nessuna sessione prevista nel periodo.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b border-border text-xs text-muted-foreground">
              <tr>
                <Th>Data</Th>
                <Th>Sessione</Th>
                <Th>Esercizi</Th>
                <Th>Focus</Th>
                <Th>Mantenimento</Th>
                <Th>Rip. forme</Th>
                <Th>Stato</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {summary.rows.map((row) => (
                <SessionProgressTableRow key={row.date} row={row} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function SessionProgressTableRow({ row }: { row: SessionProgressRow }) {
  return (
    <tr>
      <Td className="font-medium capitalize">{formatDate(row.date)}</Td>
      <Td>{row.sessionNumber}</Td>
      <Td>
        {row.exerciseCompleted}/{row.exerciseTotal}
      </Td>
      <Td>
        {row.focusCompleted}/{row.focusTotal}
      </Td>
      <Td>
        {row.maintenanceCompleted}/{row.maintenanceTotal}
      </Td>
      <Td>{row.repsTarget > 0 ? `${row.repsDone}/${row.repsTarget}` : "-"}</Td>
      <Td>
        <StatusPill status={row.status} />
      </Td>
    </tr>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted p-2">
      <div className="font-mono font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function StatusPill({ status }: { status: SessionProgressStatus }) {
  const visual = STATUS_VISUALS[status];
  const Icon = visual.Icon;
  return (
    <Badge variant="outline" className={cn("whitespace-nowrap", visual.className)}>
      <Icon className="mr-1 h-3 w-3" />
      {visual.label}
    </Badge>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2 font-medium">{children}</th>;
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={cn("px-3 py-2 align-middle", className)}>{children}</td>;
}

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("it-IT", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

const STATUS_VISUALS: Record<
  SessionProgressStatus,
  { label: string; className: string; Icon: LucideIcon }
> = {
  completed: {
    label: "Completata",
    className: "border-[color:var(--status-success)] text-[var(--status-success)]",
    Icon: CheckCircle2,
  },
  partial: {
    label: "Parziale",
    className: "border-primary/50 text-primary",
    Icon: Clock3,
  },
  future: {
    label: "Da fare",
    className: "text-muted-foreground",
    Icon: Circle,
  },
  not_started: {
    label: "Non iniziata",
    className: "text-muted-foreground",
    Icon: Circle,
  },
};
