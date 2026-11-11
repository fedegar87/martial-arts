import { useTranslations } from "next-intl";
type Props = {
  exerciseCount: number;
  minutes: number;
};

export function SessionPreview({ exerciseCount, minutes }: Props) {
  const tr = useTranslations("ui");
  return (
    <p className="text-muted-foreground text-sm">
      {tr("sessionPreview", { minutes, count: exerciseCount })}
    </p>
  );
}
