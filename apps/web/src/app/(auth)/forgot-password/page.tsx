import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const metadata: Metadata = {
  title: "Recuperar contrasena",
  robots: {
    index: false,
    follow: false
  }
};

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-6 py-12">
      <section className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">GymFlow</p>
          <h1 className="mt-2 text-2xl font-bold">Recuperar contrasena</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Ingresa tu correo para generar una solicitud de recuperacion.
          </p>
        </div>

        <ForgotPasswordForm />

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-semibold text-primary">
            Volver a login
          </Link>
        </div>
      </section>
    </main>
  );
}
