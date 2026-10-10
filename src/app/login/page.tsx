import { LoginForm } from "./login-form";

export const metadata = { title: "Entrar · Anabia Brownies" };

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary font-display text-2xl font-bold text-primary-foreground">
          AB
        </div>
        <h1 className="font-display text-3xl font-semibold">Anabia Brownies</h1>
        <p className="mt-1 text-sm text-muted">Controle de vendas e entregas</p>
      </div>
      <LoginForm />
    </main>
  );
}
