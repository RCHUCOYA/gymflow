"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PackageOpen } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { listMyOrders, type Order } from "@/services/store-service";

export default function OrdersPage() {
  const { isAuthenticated, user, accessToken } = useAuth();

  const ordersQuery = useQuery<Order[]>({
    queryKey: ["my-orders", user?.id],
    queryFn: () => listMyOrders(accessToken ?? ""),
    enabled: Boolean(accessToken && user?.role === "Cliente")
  });

  if (!isAuthenticated || !user || user.role !== "Cliente") {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-6 py-12">
        <section className="w-full rounded-lg border bg-card p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold">Debes iniciar sesion como Cliente</h1>
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
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Mis ordenes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Historial de compras y comprobantes de pago.
        </p>
        <Link href="/tienda" className="mt-4 inline-flex rounded-md border px-4 py-2 text-sm font-semibold">
          Ir a la tienda
        </Link>
      </header>

      {ordersQuery.isLoading ? <p className="text-sm text-muted-foreground">Cargando ordenes...</p> : null}
      {ordersQuery.isError ? <p className="text-sm text-destructive">No se pudieron cargar las ordenes.</p> : null}

      {!ordersQuery.isLoading && !ordersQuery.isError && ordersQuery.data?.length === 0 ? (
        <section className="rounded-lg border bg-card p-8 text-center shadow-sm">
          <PackageOpen aria-hidden className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            No tienes ordenes aun.{" "}
            <Link href="/tienda" className="font-semibold text-primary">
              Ir a la tienda
            </Link>
          </p>
        </section>
      ) : null}

      {ordersQuery.data?.length ? (
        <div className="space-y-4">
          {ordersQuery.data.map((order) => (
            <article key={order.id} className="rounded-lg border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("es-PE", {
                      dateStyle: "long"
                    })}
                  </p>
                  <p className="mt-1 font-bold">S/ {order.total.toFixed(2)}</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 capitalize">
                  {order.status}
                </span>
              </div>

              <ul className="mt-3 space-y-1 border-t pt-3">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.product.name} × {item.quantity}
                    </span>
                    <span className="font-medium">S/ {item.subtotal.toFixed(2)}</span>
                  </li>
                ))}
              </ul>

              {order.payment ? (
                <div className="mt-3 rounded-md bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                  Pago: {order.payment.method} — {order.payment.receiptCode}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}
    </main>
  );
}
