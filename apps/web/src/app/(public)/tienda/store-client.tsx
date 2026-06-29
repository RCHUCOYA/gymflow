"use client";

import { isAxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Search, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { addToCart, listProducts, type Product } from "@/services/store-service";

const paymentMethods = ["Visa", "Mastercard", "Yape", "Plin", "Transferencia"] as const;

type FeedbackState = { tone: "success" | "error"; text: string };

export function StoreClientPage() {
  const { user, accessToken, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const productsQuery = useQuery({
    queryKey: ["products", debouncedSearch],
    queryFn: () => listProducts({ search: debouncedSearch || undefined, limit: 50 })
  });

  const addMutation = useMutation({
    mutationFn: (input: { productId: string; quantity: number }) =>
      addToCart({ accessToken: accessToken ?? "", productId: input.productId, quantity: input.quantity }),
    onSuccess: () => {
      setFeedback({ tone: "success", text: "Producto agregado al carrito." });
      void queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
    },
    onError: (error) => {
      const fallback = "No se pudo agregar al carrito.";
      const message = isAxiosError<{ error?: { message?: string } }>(error)
        ? error.response?.data?.error?.message ?? fallback
        : fallback;

      setFeedback({ tone: "error", text: message });
    }
  });

  function handleSearch(value: string) {
    setSearch(value);
    clearTimeout((handleSearch as { _timer?: ReturnType<typeof setTimeout> })._timer);
    (handleSearch as { _timer?: ReturnType<typeof setTimeout> })._timer = setTimeout(
      () => setDebouncedSearch(value),
      400
    );
  }

  const canAdd = isAuthenticated && user?.role === "Cliente";

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <header className="mb-8 max-w-3xl">
        <h1 className="text-3xl font-bold">Tienda</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Proteinas, suplementos, bebidas y accesorios de fitness.
        </p>
      </header>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative flex-1 max-w-sm">
          <Search aria-hidden className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Buscar productos..."
            aria-label="Buscar productos"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm"
          />
        </label>

        {isAuthenticated && user?.role === "Cliente" ? (
          <Link
            href="/cart"
            className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold"
          >
            <ShoppingCart aria-hidden className="size-4" />
            Ver carrito
          </Link>
        ) : null}
      </div>

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

      {productsQuery.isLoading ? <p className="text-sm text-muted-foreground">Cargando productos...</p> : null}
      {productsQuery.isError ? <p className="text-sm text-destructive">No se pudieron cargar los productos.</p> : null}

      {!productsQuery.isLoading && !productsQuery.isError && productsQuery.data?.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No se encontraron productos con ese criterio.</p>
      ) : null}

      {productsQuery.data?.items.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {productsQuery.data.items.map((product: Product) => {
            const qty = quantities[product.id] ?? 1;
            const outOfStock = product.stock === 0;

            return (
              <article key={product.id} className="flex flex-col rounded-lg border bg-card shadow-sm">
                <div className="flex flex-1 flex-col p-4">
                  <div className="mb-1 text-xs font-medium text-primary">
                    {product.category.name}
                  </div>
                  <h2 className="font-semibold leading-tight">{product.name}</h2>
                  {product.description ? (
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{product.description}</p>
                  ) : null}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-bold">S/ {product.price.toFixed(2)}</span>
                    <span
                      className={`text-xs ${outOfStock ? "text-destructive" : "text-muted-foreground"}`}
                    >
                      {outOfStock ? "Sin stock" : `${product.stock} disp.`}
                    </span>
                  </div>
                </div>
                <div className="border-t p-4 pt-3">
                  <div className="mb-3 flex items-center gap-2">
                    <label htmlFor={`qty-${product.id}`} className="text-xs text-muted-foreground">
                      Cant.
                    </label>
                    <input
                      id={`qty-${product.id}`}
                      type="number"
                      min={1}
                      max={product.stock}
                      value={qty}
                      onChange={(e) =>
                        setQuantities((prev) => ({
                          ...prev,
                          [product.id]: Math.max(1, Math.min(product.stock, Number(e.target.value)))
                        }))
                      }
                      className="w-16 rounded-md border bg-background px-2 py-1 text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={!canAdd || outOfStock || addMutation.isPending}
                    onClick={() => {
                      setFeedback(null);
                      addMutation.mutate({ productId: product.id, quantity: qty });
                    }}
                    className="w-full rounded-md bg-primary py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Agregar al carrito
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}

      {productsQuery.data ? (
        <p className="mt-6 text-xs text-muted-foreground">
          Mostrando {productsQuery.data.items.length} de {productsQuery.data.total} productos
        </p>
      ) : null}
    </main>
  );
}

export { paymentMethods };
