"use client";

import { isAxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import {
  getMyMembership,
  listMembershipPlans,
  purchaseMembership,
  renewMembership
} from "@/services/memberships-service";

const paymentMethods = ["Visa", "Mastercard", "Yape", "Plin", "Transferencia"] as const;

type FeedbackState = {
  tone: "success" | "error";
  text: string;
};

export function MembershipPlansClientPage() {
  const { isAuthenticated, user, accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const plansQuery = useQuery({
    queryKey: ["membership-plans"],
    queryFn: listMembershipPlans
  });

  const membershipQuery = useQuery({
    queryKey: ["my-membership", user?.id],
    queryFn: () => getMyMembership(accessToken ?? ""),
    enabled: Boolean(accessToken && user?.role === "Cliente")
  });

  const membershipStatus = membershipQuery.data?.status ?? null;
  const shouldRenew = Boolean(membershipQuery.data);
  const canTransact = Boolean(accessToken) && user?.role === "Cliente";
  const membershipStateResolved = !canTransact || (!membershipQuery.isLoading && !membershipQuery.isError);

  const purchaseMutation = useMutation({
    mutationFn: (input: {
      membershipPlanId: string;
      paymentMethod: (typeof paymentMethods)[number];
      action: "purchase" | "renew";
    }) => {
      if (input.action === "renew") {
        return renewMembership({
          accessToken: accessToken ?? "",
          membershipPlanId: input.membershipPlanId,
          paymentMethod: input.paymentMethod
        });
      }

      return purchaseMembership({
        accessToken: accessToken ?? "",
        membershipPlanId: input.membershipPlanId,
        paymentMethod: input.paymentMethod
      });
    },
    onSuccess: async (data, variables) => {
      setFeedback({
        tone: "success",
        text:
          variables.action === "renew"
            ? `Renovacion exitosa. Comprobante: ${data.receiptCode}`
            : `Compra exitosa. Comprobante: ${data.receiptCode}`
      });

      await queryClient.invalidateQueries({ queryKey: ["my-membership", user?.id] });
    },
    onError: (error, variables) => {
      const fallbackMessage =
        variables.action === "renew"
          ? "No se pudo procesar la renovacion."
          : "No se pudo procesar la compra.";

      const message = isAxiosError<{ error?: { message?: string } }>(error)
        ? error.response?.data?.error?.message ?? fallbackMessage
        : fallbackMessage;

      setFeedback({ tone: "error", text: message });
    }
  });

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <header className="mb-8 max-w-3xl">
        <h1 className="text-3xl font-bold">Planes de membresia</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Explora beneficios, compra tu primer plan o renueva tu vigencia con pago simulado.
        </p>
      </header>

      {!isAuthenticated || !user ? (
        <div className="mb-6 rounded-md border bg-card p-4 text-sm">
          Debes <Link href="/login" className="font-semibold text-primary">iniciar sesion</Link> como Cliente para comprar o renovar.
        </div>
      ) : null}

      {isAuthenticated && user?.role !== "Cliente" ? (
        <div className="mb-6 rounded-md border bg-card p-4 text-sm text-muted-foreground">
          Solo el rol Cliente puede comprar o renovar membresias desde esta pantalla.
        </div>
      ) : null}

      {canTransact ? (
        <section className="mb-8 rounded-lg border bg-card p-5 shadow-sm">
          <h2 className="text-base font-semibold">Tu estado actual</h2>

          {membershipQuery.isLoading ? (
            <p className="mt-2 text-sm text-muted-foreground">Cargando tu membresia actual...</p>
          ) : null}

          {membershipQuery.isError ? (
            <p className="mt-2 text-sm text-destructive">
              No se pudo validar tu membresia actual. Recarga la pagina antes de continuar.
            </p>
          ) : null}

          {membershipQuery.data ? (
            <div className="mt-3 space-y-1 text-sm text-muted-foreground">
              <p>
                Plan actual: <span className="font-semibold text-foreground">{membershipQuery.data.membershipPlan.name}</span>
              </p>
              <p>
                Estado: <span className="font-semibold capitalize text-foreground">{membershipStatus}</span>
              </p>
              <p>Vence: {new Date(membershipQuery.data.endsAt).toLocaleDateString("es-PE")}</p>
              <p>
                Puedes renovar ahora para extender la vigencia segun el plan que elijas.
              </p>
            </div>
          ) : null}

          {!membershipQuery.isLoading && !membershipQuery.isError && !membershipQuery.data ? (
            <p className="mt-3 text-sm text-muted-foreground">
              No tienes membresia registrada. Puedes comprar tu primer plan ahora.
            </p>
          ) : null}
        </section>
      ) : null}

      {feedback ? (
        <p
          className={`mb-6 rounded-md border px-4 py-3 text-sm ${
            feedback.tone === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {feedback.text}
        </p>
      ) : null}

      {plansQuery.isLoading ? <p className="text-sm text-muted-foreground">Cargando planes...</p> : null}
      {plansQuery.isError ? <p className="text-sm text-destructive">No se pudieron cargar los planes.</p> : null}
      {!plansQuery.isLoading && !plansQuery.isError && plansQuery.data?.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay planes disponibles por el momento.</p>
      ) : null}

      {plansQuery.data?.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plansQuery.data.map((plan) => (
            <article key={plan.id} className="rounded-md border bg-card p-4 shadow-sm">
              <h2 className="text-xl font-semibold">{plan.name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">Duracion: {plan.durationDays} dias</p>
              <p className="mt-2 text-lg font-bold">S/ {plan.price.toFixed(2)}</p>
              <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                {Object.entries(plan.benefits).map(([key, value]) => (
                  <li key={key}>{key}: {String(value)}</li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method}
                    type="button"
                    disabled={!canTransact || !membershipStateResolved || purchaseMutation.isPending}
                    onClick={() => {
                      setFeedback(null);
                      purchaseMutation.mutate({
                        membershipPlanId: plan.id,
                        paymentMethod: method,
                        action: shouldRenew ? "renew" : "purchase"
                      });
                    }}
                    className="rounded-md border px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {shouldRenew ? `Renovar con ${method}` : `Comprar con ${method}`}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </main>
  );
}