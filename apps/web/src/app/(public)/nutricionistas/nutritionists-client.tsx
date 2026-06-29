"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Apple } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { listNutritionists, type Professional } from "@/services/professionals-service";
import { BookAppointmentModal } from "@/components/book-appointment-modal";

export function NutritionistsClientPage() {
  const { user, isAuthenticated } = useAuth();
  const [selected, setSelected] = useState<Professional | null>(null);

  const nutritionistsQuery = useQuery<Professional[]>({
    queryKey: ["nutritionists"],
    queryFn: listNutritionists
  });

  const canBook = isAuthenticated && user?.role === "Cliente";

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <header className="mb-8 max-w-3xl">
        <h1 className="text-3xl font-bold">Nutricionistas deportivos</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Agenda una consulta nutricional personalizada. Requiere plan Premium o VIP.
        </p>
      </header>

      {isAuthenticated && user?.role === "Cliente" ? (
        <div className="mb-6 rounded-md border bg-card p-3 text-sm text-muted-foreground">
          La reserva con nutricionista esta disponible exclusivamente para planes{" "}
          <strong>Premium</strong> y <strong>VIP</strong>.
        </div>
      ) : null}

      {!isAuthenticated ? (
        <div className="mb-6 rounded-md border bg-card p-3 text-sm">
          Inicia sesion como Cliente para agendar una consulta nutricional.
        </div>
      ) : null}

      {nutritionistsQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando nutricionistas...</p>
      ) : null}

      {nutritionistsQuery.isError ? (
        <p className="text-sm text-destructive">No se pudieron cargar los nutricionistas.</p>
      ) : null}

      {!nutritionistsQuery.isLoading && !nutritionistsQuery.isError && nutritionistsQuery.data?.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay nutricionistas disponibles por el momento.</p>
      ) : null}

      {nutritionistsQuery.data?.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {nutritionistsQuery.data.map((nutritionist) => (
            <article key={nutritionist.id} className="rounded-lg border bg-card p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <span
                  className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
                  aria-hidden
                >
                  <Apple className="size-5" />
                </span>
                <div>
                  <h2 className="font-semibold">
                    {nutritionist.user.firstName} {nutritionist.user.lastName}
                  </h2>
                  {nutritionist.specialty ? (
                    <p className="mt-1 text-xs font-medium text-primary">{nutritionist.specialty}</p>
                  ) : null}
                  {nutritionist.bio ? (
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{nutritionist.bio}</p>
                  ) : null}
                </div>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  disabled={!canBook}
                  onClick={() => setSelected(nutritionist)}
                  className="w-full rounded-md border px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Agendar consulta
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {selected ? (
        <BookAppointmentModal
          professional={{ ...selected, type: "nutritionist" }}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </main>
  );
}
