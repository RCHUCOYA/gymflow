"use client";

import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";

export default function ProfilePage() {
  const { isAuthenticated, user, logout } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-6 py-12">
        <section className="w-full rounded-lg border bg-card p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold">Debes iniciar sesion</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Accede para ver y administrar tu perfil en GymFlow.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Ir a login
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl px-6 py-12">
      <section className="w-full rounded-lg border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-bold">Mi perfil</h1>
        <p className="mt-2 text-sm text-muted-foreground">Informacion de sesion actual.</p>

        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Nombre</dt>
            <dd className="mt-1 text-sm font-medium">{user.firstName}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Apellido</dt>
            <dd className="mt-1 text-sm font-medium">{user.lastName}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Correo</dt>
            <dd className="mt-1 text-sm font-medium">{user.email}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Rol</dt>
            <dd className="mt-1 text-sm font-medium">{user.role}</dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={() => {
            void logout();
          }}
          className="mt-8 rounded-md border px-4 py-2 text-sm font-semibold"
        >
          Cerrar sesion
        </button>
      </section>
    </main>
  );
}
