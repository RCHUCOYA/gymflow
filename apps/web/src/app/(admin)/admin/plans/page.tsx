"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { adminListPlans, adminTogglePlanStatus, type AdminMembershipPlan } from "@/services/admin-service";

type FeedbackState = { tone: "success" | "error"; text: string };

export default function AdminPlansPage() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const plansQuery = useQuery<AdminMembershipPlan[]>({
    queryKey: ["admin-plans"],
    queryFn: () => adminListPlans(accessToken ?? ""),
    enabled: Boolean(accessToken)
  });

  const toggleMutation = useMutation({
    mutationFn: (planId: string) => adminTogglePlanStatus(accessToken ?? "", planId),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["admin-plans"] });
      setFeedback({
        tone: "success",
        text: `Plan ${data.status === "active" ? "activado" : "inactivado"} correctamente.`
      });
    }
  });

  return (
    <main className="px-6 py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Planes de membresia</h1>
        <p className="mt-1 text-sm text-muted-foreground">Activa o inactiva los planes disponibles para los clientes.</p>
      </header>

      {feedback ? (
        <p className={`mb-4 rounded-md border px-4 py-2 text-sm ${feedback.tone === "success" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700" : "border-destructive/30 bg-destructive/10 text-destructive"}`}>
          {feedback.text}
        </p>
      ) : null}

      {plansQuery.isLoading ? <p className="text-sm text-muted-foreground">Cargando...</p> : null}

      {plansQuery.data?.length ? (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full min-w-[500px] text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Nombre</th>
                <th className="px-3 py-2 text-right font-semibold">Precio</th>
                <th className="px-3 py-2 text-right font-semibold">Duracion</th>
                <th className="px-3 py-2 text-left font-semibold">Estado</th>
                <th className="px-3 py-2 font-semibold">Accion</th>
              </tr>
            </thead>
            <tbody>
              {plansQuery.data.map((plan: AdminMembershipPlan) => (
                <tr key={plan.id} className="border-t hover:bg-muted/20">
                  <td className="px-3 py-2 font-medium">{plan.name}</td>
                  <td className="px-3 py-2 text-right tabular-nums">S/ {plan.price.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{plan.durationDays} dias</td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${plan.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"}`}>
                      {plan.status === "active" ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      disabled={toggleMutation.isPending}
                      onClick={() => { setFeedback(null); toggleMutation.mutate(plan.id); }}
                      className={`text-xs font-semibold ${plan.status === "active" ? "text-destructive" : "text-emerald-600"}`}
                    >
                      {plan.status === "active" ? "Inactivar" : "Activar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </main>
  );
}
