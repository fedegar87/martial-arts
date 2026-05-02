import { LoginForm } from "./LoginForm";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return <LoginForm initialError={errorMessage(params.error)} />;
}

function errorMessage(code: string | undefined): string | null {
  if (code === "link_invalid") {
    return "Il link non è valido o è scaduto. Richiedi un nuovo reset password.";
  }

  return null;
}
