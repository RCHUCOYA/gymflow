"use client";

import { isAxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import {
  adminCreatePromotion,
  adminListPlans,
  adminListProducts,
  adminListPromotions,
  adminTogglePromotionStatus,
  type Promotion
} from "@/services/admin-service";

type FeedbackState = { tone: "success" | "error"; text: string };

export default function AdminPromotionsPage() {
  const { user, accessToken, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDiscount, setFormDiscount] = useState("");
  const [formTargetType, setFormTargetType] = useState<"product" | "membership_plan">("product");
  const [formTargetId, setFormTargetId] = useState("");
  const [formStartsAt, setFormStartsAt] = useState("");
  const [formEndsAt, setFormEndsAt] = useState("");

  const promotionsQuery = useQuery({
    queryKey: ["admin-promotions"],
    queryFn: () => adminListPromotions(accessToken ?? ""),
    enabled: Boolean(accessToken && user?.role === "Administrador")
  });

  const productsQuery = useQuery({
    queryKey: ["admin-products-select"],
    queryFn: () => adminListProducts(accessToken ?? "", { limit: 100 }),
    enabled: Boolean(accessToken && user?.role === "Administrador" && showForm && formTargetType === "product")
  });

  const plansQuery = useQuery({
    queryKey: ["admin-plans-select"],
    queryFn: () => adminListPlans(accessToken ?? ""),
    enabled: Boolean(accessToken && user?.role === "Administrador" && showForm && formTargetType === "membership_plan")
  });

  const createMutation = useMutation({
    mutationFn: () =>
      adminCreatePromotion(accessToken ?? "", {
        name: formName,
        description: formDescription || undefined,
        discountPercent: Number(formDiscount),
        targetType: formTargetType,
        ...(formTargetType === "product" ? { productId: formTargetId } : { membershipPlanId: formTargetId }),
        startsAt: new Date(formStartsAt).toISOString(),
        endsAt: new Date(formEndsAt).toISOString()
      }),
    onSuccess: () => {
      setFeedback({ tone: "success", text: "Promocion creada." });
      setShowForm(false);
      void queryClient.invalidateQueries({ queryKey: ["admin-promotions"] });
    },
    onError: (error) => {
      const fallback = "No se pudo crear la promocion.";
      const message = isAxiosError<{ error?: { message?: string } }>(error)
        ? error.response?.data?.error?.message ?? fallback
        : fallback;

      setFeedback({ tone: "error", text: message });
    }
  });

  const toggleMutation = useMutation({
    mutationFn: (promotionId: string) => adminTogglePromotionStatus(accessToken ?? "", promotionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-promotions"] });
      setFeedback({ tone: "success", text: "Estado actualizado." });
    }
  });

  if (!isAuthenticated || !user || user.role !== "Administrador") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Acceso exclusivo para Administradores.</p>
      </main>
    );
  }

  return (
    <main className="px-6 py-10">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Promociones</h1>
          <p className="mt-1 text-sm text-muted-foreground">Descuentos por producto o plan de membresia.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <PlusCircle aria-hidden className="size-4" />
          Nueva promocion
        </button>
      </header>

      {feedback ? (
        <p className={`mb-4 rounded-md border px-4 py-2 text-sm ${feedback.tone === "success" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700" : "border-destructive/30 bg-destructive/10 text-destructive"}`}>
          {feedback.text}
        </p>
      ) : null}

      {promotionsQuery.isLoading ? <p className="text-sm text-muted-foreground">Cargando...</p> : null}

      {!promotionsQuery.isLoading && promotionsQuery.data?.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay promociones registradas.</p>
      ) : null}

      {promotionsQuery.data?.items.length ? (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Nombre</th>
                <th className="px-3 py-2 text-left font-semibold">Objetivo</th>
                <th className="px-3 py-2 text-right font-semibold">Descuento</th>
                <th className="px-3 py-2 text-left font-semibold">Vigencia</th>
                <th className="px-3 py-2 text-left font-semibold">Estado</th>
                <th className="px-3 py-2 font-semibold">Accion</th>
              </tr>
            </thead>
            <tbody>
              {promotionsQuery.data.items.map((promo: Promotion) => (
                <tr key={promo.id} className="border-t hover:bg-muted/20">
                  <td className="px-3 py-2 font-medium">{promo.name}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {promo.targetType === "product"
                      ? promo.product?.name ?? "Producto eliminado"
                      : promo.membershipPlan?.name ?? "Plan eliminado"}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums font-semibold text-emerald-700">
                    {promo.discountPercent}%
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground tabular-nums">
                    {new Date(promo.startsAt).toLocaleDateString("es-PE")} – {new Date(promo.endsAt).toLocaleDateString("es-PE")}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${promo.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"}`}>
                      {promo.status === "active" ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      disabled={toggleMutation.isPending}
                      onClick={() => { setFeedback(null); toggleMutation.mutate(promo.id); }}
                      className={`text-xs font-semibold ${promo.status === "active" ? "text-destructive" : "text-emerald-600"}`}
                    >
                      {promo.status === "active" ? "Inactivar" : "Activar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {showForm ? (
        <div role="dialog" aria-modal="true" aria-label="Formulario de promocion" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-xl">
            <h2 className="text-lg font-bold">Nueva promocion</h2>
            <form
              onSubmit={(e) => { e.preventDefault(); setFeedback(null); createMutation.mutate(); }}
              className="mt-4 space-y-3"
            >
              <div>
                <label htmlFor="promo-name" className="block text-xs font-medium text-muted-foreground">Nombre</label>
                <input id="promo-name" type="text" required value={formName} onChange={(e) => setFormName(e.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label htmlFor="promo-desc" className="block text-xs font-medium text-muted-foreground">Descripcion (opcional)</label>
                <input id="promo-desc" type="text" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label htmlFor="promo-discount" className="block text-xs font-medium text-muted-foreground">Descuento (%)</label>
                <input id="promo-discount" type="number" required min="0.01" max="100" step="0.01" value={formDiscount} onChange={(e) => setFormDiscount(e.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label htmlFor="promo-type" className="block text-xs font-medium text-muted-foreground">Tipo de objetivo</label>
                <select id="promo-type" value={formTargetType} onChange={(e) => { setFormTargetType(e.target.value as "product" | "membership_plan"); setFormTargetId(""); }} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
                  <option value="product">Producto</option>
                  <option value="membership_plan">Plan de membresia</option>
                </select>
              </div>
              <div>
                <label htmlFor="promo-target" className="block text-xs font-medium text-muted-foreground">
                  {formTargetType === "product" ? "Producto" : "Plan de membresia"}
                </label>
                <select id="promo-target" required value={formTargetId} onChange={(e) => setFormTargetId(e.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
                  <option value="">Seleccionar...</option>
                  {formTargetType === "product"
                    ? productsQuery.data?.items.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)
                    : plansQuery.data?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="promo-starts" className="block text-xs font-medium text-muted-foreground">Inicio</label>
                  <input id="promo-starts" type="date" required value={formStartsAt} onChange={(e) => setFormStartsAt(e.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
                </div>
                <div>
                  <label htmlFor="promo-ends" className="block text-xs font-medium text-muted-foreground">Fin</label>
                  <input id="promo-ends" type="date" required value={formEndsAt} onChange={(e) => setFormEndsAt(e.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={createMutation.isPending} className="flex-1 rounded-md bg-primary py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                  {createMutation.isPending ? "Creando..." : "Crear promocion"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="rounded-md border px-4 py-2 text-sm font-semibold">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}
