"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { listMembershipPlans, purchaseMembership } from "@/services/memberships-service";

const paymentMethods = ["Visa", "Mastercard", "Yape", "Plin", "Transferencia"] as const;

export default function MembershipPlansPage() {
  const { isAuthenticated, user, accessToken } = useAuth();
  const [message, setMessage] = useState<string | null>(null);

  const plansQuery = useQuery({
    queryKey: ["membership-plans"],
    queryFn: listMembershipPlans
  });

  const purchaseMutation = useMutation({
    mutationFn: (input: { membershipPlanId: string; paymentMethod: (typeof paymentMethods)[number] }) =>
      purchaseMembership({
        accessToken: accessToken ?? "",
        membershipPlanId: input.membershipPlanId,
        paymentMethod: input.paymentMethod
      }),
    onSuccess: (data) => {
      setMessage(`Compra exitosa. Comprobante: ${data.receiptCode}`);
    },
    onError: () => {
      setMessage("No se pudo procesar la compra.");
    }
  });

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Planes de membresia</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Explora planes y compra con pago simulado.
        </p>
      </header>

      {!isAuthenticated || !user ? (
        <div className="mb-6 rounded-md border bg-card p-4 text-sm">
          Debes <Link href="/login" className="font-semibold text-primary">iniciar sesion</Link> como Cliente para comprar.
        </div>
      ) : null}

      {message ? <p className="mb-6 text-sm text-muted-foreground">{message}</p> : null}

      {plansQuery.isLoading ? <p>Cargando planes...</p> : null}
      {plansQuery.isError ? <p>No se pudieron cargar los planes.</p> : null}

      {plansQuery.data ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plansQuery.data.map((plan) => (
            <article key={plan.id} className="rounded-md border bg-card p-4">
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
                    disabled={!accessToken || user?.role !== "Cliente" || purchaseMutation.isPending}
                    onClick={() => {
                      purchaseMutation.mutate({
                        membershipPlanId: plan.id,
                        paymentMethod: method
                      });
                    }}
                    className="rounded-md border px-3 py-1.5 text-xs font-semibold"
                  >
                    Comprar con {method}
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
