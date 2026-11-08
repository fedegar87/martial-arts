import { AppRouteSkeleton } from "@/components/shared/AppRouteSkeleton";
import { BulletinHeader } from "@/components/news/BulletinHeader";

export default function Loading() {
  return (
    <AppRouteSkeleton
      variant="calendar"
      header={<BulletinHeader active="calendar" />}
    />
  );
}
