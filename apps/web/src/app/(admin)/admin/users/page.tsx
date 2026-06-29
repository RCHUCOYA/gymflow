"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { listUsers } from "@/services/users-service";

export default function AdminUsersPage() {
  const { isAuthenticated, user, accessToken } = useAuth();

  const usersQuery = useQuery({
    queryKey: ["admin-users", user?.id],
    queryFn: () => listUsers(accessToken ?? ""),
    enabled: Boolean(isAuthenticated && user?.role === "Administrador" && accessToken)
  });

  if (!isAuthenticated || !user) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-6 py-12">
        <section className="w-full rounded-lg border bg-card p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold">Acceso restringido</h1>
          <p className="mt-3 text-sm text-muted-foreground">Necesitas iniciar sesion para continuar.</p>
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

  if (user.role !== "Administrador") {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-6 py-12">
        <section className="w-full rounded-lg border bg-card p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold">Sin permisos</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Este modulo requiere rol Administrador.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl px-6 py-12">
      <section className="w-full rounded-lg border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-bold">Administracion de usuarios</h1>

        {usersQuery.isLoading ? (
          <p className="mt-4 text-sm text-muted-foreground">Cargando usuarios...</p>
        ) : null}

        {usersQuery.isError ? (
          <p className="mt-4 text-sm text-destructive">No se pudieron cargar los usuarios.</p>
        ) : null}

        {usersQuery.data ? (
          <div className="mt-6 overflow-x-auto rounded-md border">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Nombre</th>
                  <th className="px-3 py-2 text-left font-semibold">Correo</th>
                  <th className="px-3 py-2 text-left font-semibold">Rol</th>
                  <th className="px-3 py-2 text-left font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody>
                {usersQuery.data.items.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-3 py-2">{item.firstName} {item.lastName}</td>
                    <td className="px-3 py-2">{item.email}</td>
                    <td className="px-3 py-2">{item.role.name}</td>
                    <td className="px-3 py-2">{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </main>
  );
}
