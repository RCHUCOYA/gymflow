"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { listUsers } from "@/services/users-service";

export default function AdminUsersPage() {
  const { user, accessToken } = useAuth();

  const usersQuery = useQuery({
    queryKey: ["admin-users", user?.id],
    queryFn: () => listUsers(accessToken ?? ""),
    enabled: Boolean(user?.role === "Administrador" && accessToken)
  });

  return (
    <main className="px-6 py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Listado de todos los usuarios registrados en GymFlow.
        </p>
      </header>

      {usersQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando usuarios...</p>
      ) : null}

      {usersQuery.isError ? (
        <p className="text-sm text-destructive">No se pudieron cargar los usuarios.</p>
      ) : null}

      {!usersQuery.isLoading && !usersQuery.isError && usersQuery.data?.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay usuarios registrados.</p>
      ) : null}

      {usersQuery.data?.items.length ? (
        <div className="overflow-x-auto rounded-md border">
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
                <tr key={item.id} className="border-t hover:bg-muted/20">
                  <td className="px-3 py-2 font-medium">{item.firstName} {item.lastName}</td>
                  <td className="px-3 py-2 text-muted-foreground">{item.email}</td>
                  <td className="px-3 py-2">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                      {item.role.name}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${item.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"}`}>
                      {item.status === "active" ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {usersQuery.data ? (
        <p className="mt-4 text-xs text-muted-foreground">
          {usersQuery.data.total} usuario{usersQuery.data.total !== 1 ? "s" : ""} registrados
        </p>
      ) : null}
    </main>
  );
}
