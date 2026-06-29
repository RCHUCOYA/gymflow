"use client";

import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="w-full max-w-sm rounded-lg border bg-card p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold">Acceso restringido</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Necesitas iniciar sesion para continuar.
          </p>
          <Link
            href="/login"
            className="mt-5 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Iniciar sesion
          </Link>
        </div>
      </div>
    );
  }

  if (user.role !== "Administrador") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="w-full max-w-sm rounded-lg border bg-card p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold">Sin permisos</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Este modulo requiere rol Administrador.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
