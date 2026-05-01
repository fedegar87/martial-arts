import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { SignOutButton } from "@/components/profile/SignOutButton";
import { GradeEditor } from "@/components/profile/GradeEditor";
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

      <SignOutButton />
    </div>
  );
}
