"use client";

import { isAxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import {
  adminCreateProduct,
  adminListCategories,
  adminListProducts,
  adminToggleProductStatus,
  adminUpdateProduct,
  type AdminProduct,
  type Category
} from "@/services/admin-service";

type FeedbackState = { tone: "success" | "error"; text: string };

type ProductFormData = {
  name: string;
  price: string;
  stock: string;
  categoryId: string;
  description: string;
};

const INITIAL_FORM: ProductFormData = {
  name: "",
  price: "",
  stock: "",
  categoryId: "",
  description: ""
};

export default function AdminProductsPage() {
  const { user, accessToken, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [form, setForm] = useState<ProductFormData>(INITIAL_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  const productsQuery = useQuery({
    queryKey: ["admin-products", search],
    queryFn: () => adminListProducts(accessToken ?? "", { search: search || undefined }),
    enabled: Boolean(accessToken && user?.role === "Administrador")
  });

  const categoriesQuery = useQuery<Category[]>({
    queryKey: ["admin-categories"],
    queryFn: () => adminListCategories(accessToken ?? ""),
    enabled: Boolean(accessToken && user?.role === "Administrador")
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const data = {
        name: form.name,
        price: Number(form.price),
        stock: Number(form.stock),
        categoryId: form.categoryId,
        ...(form.description ? { description: form.description } : {})
      };

      if (editingId) {
        return adminUpdateProduct(accessToken ?? "", editingId, data);
      }

      return adminCreateProduct(accessToken ?? "", data);
    },
    onSuccess: () => {
      setFeedback({ tone: "success", text: editingId ? "Producto actualizado." : "Producto creado." });
      setShowForm(false);
      setForm(INITIAL_FORM);
      setEditingId(null);
      void queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (error) => {
      const fallback = "No se pudo guardar el producto.";
      const message = isAxiosError<{ error?: { message?: string } }>(error)
        ? error.response?.data?.error?.message ?? fallback
        : fallback;

      setFeedback({ tone: "error", text: message });
    }
  });

  const toggleMutation = useMutation({
    mutationFn: (productId: string) => adminToggleProductStatus(accessToken ?? "", productId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-products"] });
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
          <h1 className="text-2xl font-bold">Productos</h1>
          <p className="mt-1 text-sm text-muted-foreground">Catalogo e inventario de la tienda.</p>
        </div>
        <button
          type="button"
          onClick={() => { setShowForm(true); setEditingId(null); setForm(INITIAL_FORM); }}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <PlusCircle aria-hidden className="size-4" />
          Nuevo producto
        </button>
      </header>

      {feedback ? (
        <p className={`mb-4 rounded-md border px-4 py-2 text-sm ${feedback.tone === "success" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700" : "border-destructive/30 bg-destructive/10 text-destructive"}`}>
          {feedback.text}
        </p>
      ) : null}

      <input
        type="search"
        placeholder="Buscar por nombre o categoria..."
        aria-label="Buscar productos"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full max-w-sm rounded-md border bg-background px-3 py-2 text-sm"
      />

      {productsQuery.isLoading ? <p className="text-sm text-muted-foreground">Cargando...</p> : null}

      {productsQuery.data?.items.length ? (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full min-w-[600px] text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Nombre</th>
                <th className="px-3 py-2 text-left font-semibold">Categoria</th>
                <th className="px-3 py-2 text-right font-semibold">Precio</th>
                <th className="px-3 py-2 text-right font-semibold">Stock</th>
                <th className="px-3 py-2 text-left font-semibold">Estado</th>
                <th className="px-3 py-2 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productsQuery.data.items.map((product: AdminProduct) => (
                <tr key={product.id} className="border-t hover:bg-muted/20">
                  <td className="px-3 py-2">{product.name}</td>
                  <td className="px-3 py-2 text-muted-foreground">{product.category.name}</td>
                  <td className="px-3 py-2 text-right tabular-nums">S/ {product.price.toFixed(2)}</td>
                  <td className={`px-3 py-2 text-right tabular-nums ${product.stock === 0 ? "text-destructive font-semibold" : ""}`}>{product.stock}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${product.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"}`}>
                      {product.status === "active" ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(product.id);
                          setForm({
                            name: product.name,
                            price: String(product.price),
                            stock: String(product.stock),
                            categoryId: product.category.id,
                            description: product.description ?? ""
                          });
                          setShowForm(true);
                        }}
                        className="text-xs font-semibold text-primary"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        disabled={toggleMutation.isPending}
                        onClick={() => { setFeedback(null); toggleMutation.mutate(product.id); }}
                        className={`text-xs font-semibold ${product.status === "active" ? "text-destructive" : "text-emerald-600"}`}
                      >
                        {product.status === "active" ? "Inactivar" : "Activar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {showForm ? (
        <div role="dialog" aria-modal="true" aria-label="Formulario de producto" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-xl">
            <h2 className="text-lg font-bold">{editingId ? "Editar producto" : "Nuevo producto"}</h2>
            <form
              onSubmit={(e) => { e.preventDefault(); setFeedback(null); saveMutation.mutate(); }}
              className="mt-4 space-y-3"
            >
              {(["name", "price", "stock", "description"] as const).map((field) => (
                <div key={field}>
                  <label htmlFor={`p-${field}`} className="block text-xs font-medium text-muted-foreground capitalize">{field === "description" ? "Descripcion" : field === "price" ? "Precio (S/)" : field === "stock" ? "Stock" : "Nombre"}</label>
                  <input
                    id={`p-${field}`}
                    type={field === "price" || field === "stock" ? "number" : "text"}
                    required={field !== "description"}
                    min={field === "price" ? "0.01" : field === "stock" ? "0" : undefined}
                    step={field === "price" ? "0.01" : undefined}
                    value={form[field]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))}
                    className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  />
                </div>
              ))}
              <div>
                <label htmlFor="p-category" className="block text-xs font-medium text-muted-foreground">Categoria</label>
                <select
                  id="p-category"
                  required
                  value={form.categoryId}
                  onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Seleccionar...</option>
                  {categoriesQuery.data?.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saveMutation.isPending} className="flex-1 rounded-md bg-primary py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                  {saveMutation.isPending ? "Guardando..." : "Guardar"}
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
