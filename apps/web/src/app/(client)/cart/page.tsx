"use client";

import { isAxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import {
  checkout,
  getCart,
  removeFromCart,
  updateCartItemQuantity
} from "@/services/store-service";

const paymentMethods = ["Visa", "Mastercard", "Yape", "Plin", "Transferencia"] as const;

type FeedbackState = { tone: "success" | "error"; text: string };

export default function CartPage() {
  const { user, accessToken, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<(typeof paymentMethods)[number]>("Visa");

  const cartQuery = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: () => getCart(accessToken ?? ""),
    enabled: Boolean(accessToken && user?.role === "Cliente")
  });

  const updateMutation = useMutation({
    mutationFn: (input: { cartItemId: string; quantity: number }) =>
      updateCartItemQuantity({ accessToken: accessToken ?? "", ...input }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["cart", user?.id] }),
    onError: (error) => {
      const fallback = "No se pudo actualizar el item.";
      const message = isAxiosError<{ error?: { message?: string } }>(error)
        ? error.response?.data?.error?.message ?? fallback
        : fallback;

      setFeedback({ tone: "error", text: message });
    }
  });

  const removeMutation = useMutation({
    mutationFn: (cartItemId: string) =>
      removeFromCart({ accessToken: accessToken ?? "", cartItemId }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["cart", user?.id] })
  });

  const checkoutMutation = useMutation({
    mutationFn: () =>
      checkout({ accessToken: accessToken ?? "", paymentMethod: selectedMethod }),
    onSuccess: (data) => {
      setFeedback({
        tone: "success",
        text: `Compra confirmada. Comprobante: ${data.receiptCode}. Total: S/ ${data.total.toFixed(2)}`
      });
      void queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      const fallback = "No se pudo completar la compra.";
      const message = isAxiosError<{ error?: { message?: string } }>(error)
        ? error.response?.data?.error?.message ?? fallback
        : fallback;

      setFeedback({ tone: "error", text: message });
    }
  });

  if (!isAuthenticated || !user) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-6 py-12">
        <section className="w-full rounded-lg border bg-card p-8 text-center shadow-sm">
          <ShoppingCart aria-hidden className="mx-auto size-12 text-muted-foreground" />
          <h1 className="mt-4 text-2xl font-bold">Debes iniciar sesion</h1>
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

  if (user.role !== "Cliente") {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-6 py-12">
        <section className="w-full rounded-lg border bg-card p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold">Solo para Clientes</h1>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mi carrito</h1>
          <p className="mt-1 text-sm text-muted-foreground">Revisa y confirma tu compra.</p>
        </div>
        <Link href="/tienda" className="rounded-md border px-4 py-2 text-sm font-semibold">
          Seguir comprando
        </Link>
      </header>

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

      {cartQuery.isLoading ? <p className="text-sm text-muted-foreground">Cargando carrito...</p> : null}
      {cartQuery.isError ? <p className="text-sm text-destructive">No se pudo cargar el carrito.</p> : null}

      {!cartQuery.isLoading && !cartQuery.isError && cartQuery.data?.items.length === 0 ? (
        <section className="rounded-lg border bg-card p-8 text-center shadow-sm">
          <ShoppingCart aria-hidden className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            Tu carrito esta vacio.{" "}
            <Link href="/tienda" className="font-semibold text-primary">
              Ir a la tienda
            </Link>
          </p>
        </section>
      ) : null}

      {cartQuery.data?.items.length ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            {cartQuery.data.items.map((item) => (
              <article
                key={item.id}
                className="flex items-start gap-4 rounded-lg border bg-card p-4 shadow-sm"
              >
                <div className="flex-1">
                  <p className="font-semibold">{item.product.name}</p>
                  <p className="text-sm text-muted-foreground">S/ {item.product.price.toFixed(2)} c/u</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Reducir cantidad"
                    disabled={item.quantity <= 1 || updateMutation.isPending}
                    onClick={() =>
                      updateMutation.mutate({ cartItemId: item.id, quantity: item.quantity - 1 })
                    }
                    className="flex size-7 items-center justify-center rounded-md border disabled:opacity-40"
                  >
                    <Minus aria-hidden className="size-3" />
                  </button>
                  <span className="w-6 text-center text-sm tabular-nums">{item.quantity}</span>
                  <button
                    type="button"
                    aria-label="Aumentar cantidad"
                    disabled={item.quantity >= item.product.stock || updateMutation.isPending}
                    onClick={() =>
                      updateMutation.mutate({ cartItemId: item.id, quantity: item.quantity + 1 })
                    }
                    className="flex size-7 items-center justify-center rounded-md border disabled:opacity-40"
                  >
                    <Plus aria-hidden className="size-3" />
                  </button>
                </div>
                <p className="w-20 text-right text-sm font-semibold">
                  S/ {item.subtotal.toFixed(2)}
                </p>
                <button
                  type="button"
                  aria-label={`Eliminar ${item.product.name}`}
                  disabled={removeMutation.isPending}
                  onClick={() => removeMutation.mutate(item.id)}
                  className="text-destructive hover:opacity-80 disabled:opacity-40"
                >
                  <Trash2 aria-hidden className="size-4" />
                </button>
              </article>
            ))}
          </div>

          <aside className="rounded-lg border bg-card p-5 shadow-sm">
            <h2 className="font-semibold">Resumen</h2>
            <div className="mt-4 flex justify-between text-sm">
              <span>Subtotal</span>
              <span className="font-medium">S/ {cartQuery.data.total.toFixed(2)}</span>
            </div>
            <div className="my-4 border-t" />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>S/ {cartQuery.data.total.toFixed(2)}</span>
            </div>
            <div className="mt-4">
              <label htmlFor="payment-method" className="block text-xs font-medium text-muted-foreground">
                Metodo de pago
              </label>
              <select
                id="payment-method"
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value as (typeof paymentMethods)[number])}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              disabled={checkoutMutation.isPending}
              onClick={() => {
                setFeedback(null);
                checkoutMutation.mutate();
              }}
              className="mt-4 w-full rounded-md bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {checkoutMutation.isPending ? "Procesando..." : "Confirmar compra"}
            </button>
            <Link
              href="/orders"
              className="mt-3 block text-center text-xs text-primary underline-offset-2 hover:underline"
            >
              Ver mis ordenes
            </Link>
          </aside>
        </div>
      ) : null}
    </main>
  );
}
