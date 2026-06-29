"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { adminListAuditLogs, type AuditLog } from "@/services/admin-service";

export default function AdminAuditPage() {
  const { user, accessToken, isAuthenticated } = useAuth();
  const [entityFilter, setEntityFilter] = useState("");
  const [page, setPage] = useState(1);

  const logsQuery = useQuery({
    queryKey: ["admin-audit-logs", entityFilter, page],
    queryFn: () =>
      adminListAuditLogs(accessToken ?? "", {
        page,
        limit: 25,
        ...(entityFilter ? { entity: entityFilter } : {})
      }),
    enabled: Boolean(accessToken && user?.role === "Administrador")
  });

  if (!isAuthenticated || !user || user.role !== "Administrador") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Acceso exclusivo para Administradores.</p>
      </main>
    );
  }

  const entityOptions = [
    "Product",
    "MembershipPlan",
    "Room",
    "RoomSchedule",
    "Promotion",
    "User"
  ];

  return (
    <main className="px-6 py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Auditoria</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Registro de acciones realizadas en el sistema.
        </p>
      </header>

      <div className="mb-4 flex gap-3">
        <select
          aria-label="Filtrar por entidad"
          value={entityFilter}
          onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="">Todas las entidades</option>
          {entityOptions.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      {logsQuery.isLoading ? <p className="text-sm text-muted-foreground">Cargando registros...</p> : null}
      {logsQuery.isError ? <p className="text-sm text-destructive">No se pudieron cargar los registros.</p> : null}

      {!logsQuery.isLoading && logsQuery.data?.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay registros de auditoria.</p>
      ) : null}

      {logsQuery.data?.items.length ? (
        <>
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full min-w-[700px] text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Fecha</th>
                  <th className="px-3 py-2 text-left font-semibold">Actor</th>
                  <th className="px-3 py-2 text-left font-semibold">Accion</th>
                  <th className="px-3 py-2 text-left font-semibold">Entidad</th>
                </tr>
              </thead>
              <tbody>
                {logsQuery.data.items.map((log: AuditLog) => (
                  <tr key={log.id} className="border-t hover:bg-muted/20">
                    <td className="px-3 py-2 text-xs tabular-nums text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td className="px-3 py-2">
                      <p className="font-medium">{log.actor.firstName} {log.actor.lastName}</p>
                      <p className="text-xs text-muted-foreground">{log.actor.email}</p>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">{log.action}</td>
                    <td className="px-3 py-2">
                      <span className="text-xs font-semibold">{log.entity}</span>
                      {log.entityId ? (
                        <p className="font-mono text-[10px] text-muted-foreground">{log.entityId}</p>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-md border px-3 py-1 disabled:opacity-40"
            >
              Anterior
            </button>
            <span className="text-muted-foreground">
              Pagina {page} de {logsQuery.data.totalPages} ({logsQuery.data.total} registros)
            </span>
            <button
              type="button"
              disabled={page >= logsQuery.data.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-md border px-3 py-1 disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </>
      ) : null}
    </main>
  );
}
