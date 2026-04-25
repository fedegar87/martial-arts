import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { listExamProgramsForSchool } from "@/lib/queries/exam-programs";
import { Card } from "@/components/ui/card";
import { LibraryNav } from "@/components/library/LibraryNav";
import { DisciplineToggle } from "@/components/library/DisciplineToggle";
import { DISCIPLINE_LABELS } from "@/lib/labels";
import type { Discipline } from "@/lib/types";

type Props = { searchParams: Promise<{ d?: string }> };

export default async function ExamListPage({ searchParams }: Props) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const { d } = await searchParams;
  const discipline: Discipline = d === "taichi" ? "taichi" : "shaolin";
  const exams = await listExamProgramsForSchool(profile.school_id, discipline);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Libreria</h1>
        <p className="text-muted-foreground text-sm">
          Per esame — {DISCIPLINE_LABELS[discipline]}
        </p>
      </header>

      <DisciplineToggle
        current={discipline}
        basePath="/library/exam"
        hiddenTaichi={profile.assigned_level_taichi === 0}
      />
      <LibraryNav />

      <div className="space-y-2">
        {exams.map((exam) => (
          <Link key={exam.id} href={`/library/exam/${exam.id}`}>
            <Card className="hover:bg-muted/50 flex flex-row items-center gap-3 p-3 transition-colors">
              <div className="flex-1">
                <div className="font-medium">{exam.level_name}</div>
                {exam.description && (
                  <div className="text-muted-foreground text-sm">
                    {exam.description}
                  </div>
                )}
              </div>
              <ChevronRight className="text-muted-foreground h-4 w-4" />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
