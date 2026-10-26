import { LoginForm } from "./login-form";

export const metadata = { title: "Entrar · Anabia Brownies" };

// Só definidas no deploy de demonstração (portfólio): mostra e preenche o login de teste
const demo =
  process.env.NEXT_PUBLIC_DEMO_EMAIL && process.env.NEXT_PUBLIC_DEMO_PASSWORD
    ? { email: process.env.NEXT_PUBLIC_DEMO_EMAIL, password: process.env.NEXT_PUBLIC_DEMO_PASSWORD }
    : null;

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
      {demo && (
        <div className="mb-4 rounded-2xl border border-accent/40 bg-accent/10 p-4 text-sm">
          <p className="font-semibold">Ambiente de demonstração</p>
          <p className="mt-1 text-muted">
            Dados fictícios. Entre com <strong className="text-foreground">{demo.email}</strong> e senha{" "}
            <strong className="text-foreground">{demo.password}</strong> (já preenchidos).
          </p>
        </div>
      )}
      <LoginForm demo={demo} />
    </main>
  );
}
