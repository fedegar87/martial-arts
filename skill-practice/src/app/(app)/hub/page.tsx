import { redirect } from "next/navigation";
import { HubGrid } from "@/components/hub/HubGrid";
import { HubBackground } from "@/components/hub/HubBackground";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { isProfileOnboarded } from "@/lib/onboarding-state";

export default async function HubPage() {
  let profile = null;
  try {
    profile = await getCurrentProfile();
  } catch {
    redirect("/login");
  }

  if (!profile) {
    redirect("/login");
  }

  if (!isProfileOnboarded(profile)) {
    redirect("/onboarding");
  }

  return (
    <>
      <HubBackground />
      <section className="relative z-10 mx-auto max-w-md">
        <h1 className="hub-anim-heading mt-8 text-[22px] font-medium text-foreground">
          Dove vuoi praticare oggi?
        </h1>
        <p className="hub-anim-subtitle mt-1 text-sm text-muted-foreground">
          Scegli un&apos;area.
        </p>
        <div className="mt-8">
          <HubGrid />
        </div>
      </section>
    </>
  );
}
