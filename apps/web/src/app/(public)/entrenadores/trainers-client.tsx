"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Dumbbell } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { listTrainers, type Professional } from "@/services/professionals-service";
import { BookAppointmentModal } from "@/components/book-appointment-modal";

export function TrainersClientPage() {
  const { user, isAuthenticated } = useAuth();
  const [selected, setSelected] = useState<Professional | null>(null);

  const trainersQuery = useQuery<Professional[]>({
    queryKey: ["trainers"],
    queryFn: listTrainers
  });

  const canBook = isAuthenticated && user?.role === "Cliente";

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <header className="mb-8 max-w-3xl">
        <h1 className="text-3xl font-bold">Entrenadores personales</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Agenda una sesion con un entrenador certificado. Requiere plan Premium o VIP.
        </p>
      </header>

      {isAuthenticated && user?.role === "Cliente" ? (
        <div className="mb-6 rounded-md border bg-card p-3 text-sm text-muted-foreground">
          Para reservar con entrenador personal necesitas plan <strong>Premium</strong> o <strong>VIP</strong>.
        </div>
      ) : null}

      {!isAuthenticated ? (
        <div className="mb-6 rounded-md border bg-card p-3 text-sm">
          Inicia sesion como Cliente para agendar una sesion.
        </div>
      ) : null}

      {trainersQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando entrenadores...</p>
      ) : null}

      {trainersQuery.isError ? (
        <p className="text-sm text-destructive">No se pudieron cargar los entrenadores.</p>
      ) : null}

      {!trainersQuery.isLoading && !trainersQuery.isError && trainersQuery.data?.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay entrenadores disponibles por el momento.</p>
      ) : null}

      {trainersQuery.data?.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {trainersQuery.data.map((trainer) => (
            <article key={trainer.id} className="rounded-lg border bg-card p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <span
                  className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
                  aria-hidden
                >
                  <Dumbbell className="size-5" />
                </span>
                <div>
                  <h2 className="font-semibold">
                    {trainer.user.firstName} {trainer.user.lastName}
                  </h2>
                  {trainer.specialty ? (
                    <p className="mt-1 text-xs font-medium text-primary">{trainer.specialty}</p>
                  ) : null}
                  {trainer.bio ? (
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{trainer.bio}</p>
                  ) : null}
                </div>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  disabled={!canBook}
                  onClick={() => setSelected(trainer)}
                  className="w-full rounded-md border px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Agendar sesion
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {selected ? (
        <BookAppointmentModal
          professional={{ ...selected, type: "trainer" }}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </main>
  );
}
