import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, CalendarPlus } from "lucide-react";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { SignOutButton } from "@/components/profile/SignOutButton";
import { GradeEditor } from "@/components/profile/GradeEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">{profile.display_name}</h1>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">I tuoi gradi</CardTitle>
        </CardHeader>
        <CardContent>
          <GradeEditor
            assignedLevelShaolin={profile.assigned_level_shaolin}
            assignedLevelTaichi={profile.assigned_level_taichi}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Allenamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button asChild variant="outline" className="w-full justify-start">
            <Link href="/sessions/setup">
              <CalendarPlus className="mr-2 h-4 w-4" />
              Modifica sessioni
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start">
            <Link href="/sessions/calendar">
              <CalendarDays className="mr-2 h-4 w-4" />
              Calendario sessioni
            </Link>
          </Button>
        </CardContent>
      </Card>

      <SignOutButton />
    </div>
  );
}
