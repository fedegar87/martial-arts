import { HubBackground } from "@/components/hub/HubBackground";
import { HubGrid } from "@/components/hub/HubGrid";
import { Button } from "@/components/ui/button";
import { isProfileOnboarded } from "@/lib/onboarding-state";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { Bell } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function HubPage() {
  const tr = await getTranslations("ui");
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (!isProfileOnboarded(profile)) {
    redirect("/onboarding");
  }

  return (
    <>
      <HubBackground />
      <section className="hub-page relative z-10 mx-auto">
        <header className="mt-8 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="label-font text-primary text-xs tracking-wider uppercase wrap-anywhere">
              {profile.display_name}
            </p>
            <h1 className="hub-anim-heading mt-1 text-2xl font-medium text-foreground">
              {tr("hubQuestion")}
            </h1>
            <p className="hub-anim-subtitle mt-1 text-sm text-muted-foreground">
              {tr("hubIntroduction")}
            </p>
          </div>
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="min-h-12 min-w-12 text-muted-foreground"
          >
            <Link href="/news" aria-label={tr("news")} title={tr("news")}>
              <Bell className="h-5 w-5" aria-hidden />
            </Link>
          </Button>
        </header>
        <div className="mt-6">
          <HubGrid />
        </div>
      </section>
    </>
  );
}
