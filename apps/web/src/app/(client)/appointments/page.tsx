"use client";

import { isAxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { CalendarOff, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import {
  cancelAppointment,
  listMyAppointments,
  type Appointment
} from "@/services/professionals-service";

type FeedbackState = {
  tone: "success" | "error";
  text: string;
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string; Icon: typeof CheckCircle2 }> = {
    confirmed: {
      label: "Confirmada",
      className: "bg-emerald-100 text-emerald-800",
      Icon: CheckCircle2
    },
    cancelled: {
      label: "Cancelada",
      className: "bg-muted text-muted-foreground",
      Icon: XCircle
    },
    completed: {
      label: "Completada",
      className: "bg-blue-100 text-blue-800",
      Icon: CheckCircle2
    }
  };

  const entry = map[status] ?? map.confirmed;
  const { Icon } = entry;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${entry.className}`}>
      <Icon aria-hidden className="size-3" />
      {entry.label}
    </span>
  );
}

export default function AppointmentsPage() {
  const { isAuthenticated, user, accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const appointmentsQuery = useQuery<Appointment[]>({
    queryKey: ["my-appointments", user?.id],
    queryFn: () => listMyAppointments(accessToken ?? ""),
    enabled: Boolean(accessToken && user?.role === "Cliente")
  });

  const cancelMutation = useMutation({
    mutationFn: (appointmentId: string) =>
      cancelAppointment({ accessToken: accessToken ?? "", appointmentId }),
    onSuccess: () => {
      setFeedback({ tone: "success", text: "Cita cancelada correctamente." });
      void queryClient.invalidateQueries({ queryKey: ["my-appointments", user?.id] });
    },
    onError: (error) => {
      const fallback = "No se pudo cancelar la cita.";
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
          <CalendarOff aria-hidden className="mx-auto size-12 text-muted-foreground" />
          <h1 className="mt-4 text-2xl font-bold">Debes iniciar sesion</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Accede a tu cuenta para ver tus citas con profesionales.
          </p>
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
          <p className="mt-2 text-sm text-muted-foreground">
            Los profesionales gestionan su agenda desde otra seccion.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Mis citas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Historial de sesiones con entrenadores y nutricionistas.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/entrenadores"
            className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Agendar entrenador
          </Link>
          <Link
            href="/nutricionistas"
            className="inline-flex rounded-md border px-4 py-2 text-sm font-semibold"
          >
            Agendar nutricionista
          </Link>
        </div>
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

      {appointmentsQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando citas...</p>
      ) : null}

      {appointmentsQuery.isError ? (
        <p className="text-sm text-destructive">No se pudieron cargar tus citas.</p>
      ) : null}

      {!appointmentsQuery.isLoading && !appointmentsQuery.isError && appointmentsQuery.data?.length === 0 ? (
        <section className="rounded-lg border bg-card p-8 text-center shadow-sm">
          <CalendarOff aria-hidden className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            No tienes citas registradas.{" "}
            <Link href="/entrenadores" className="font-semibold text-primary">
              Agenda una sesion ahora.
            </Link>
          </p>
        </section>
      ) : null}

      {appointmentsQuery.data?.length ? (
        <div className="space-y-3">
          {appointmentsQuery.data.map((appt) => {
            const isFuture = new Date(appt.startsAt) > new Date();
            const canCancel = appt.status === "confirmed" && isFuture;
            const isOpen = expanded === appt.id;

            return (
              <article key={appt.id} className="rounded-lg border bg-card shadow-sm">
                <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold">
                      {appt.professional.user.firstName} {appt.professional.user.lastName}
                      <span className="ml-2 text-xs font-normal text-muted-foreground capitalize">
                        ({appt.professional.type === "trainer" ? "Entrenador" : "Nutricionista"})
                      </span>
                    </p>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock aria-hidden className="size-3.5" />
                      {new Date(appt.startsAt).toLocaleString("es-PE", { dateStyle: "long", timeStyle: "short" })}
                      {" — "}
                      {new Date(appt.endsAt).toLocaleTimeString("es-PE", { timeStyle: "short" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={appt.status} />
                    {(appt.trainingProgress?.length ?? 0) > 0 || (appt.nutritionPlans?.length ?? 0) > 0 ? (
                      <button
                        type="button"
                        onClick={() => setExpanded(isOpen ? null : appt.id)}
                        className="text-xs font-semibold text-primary"
                        aria-expanded={isOpen}
                      >
                        {isOpen ? "Ocultar" : "Ver seguimiento"}
                      </button>
                    ) : null}
                    {canCancel ? (
                      <button
                        type="button"
                        disabled={cancelMutation.isPending}
                        onClick={() => {
                          setFeedback(null);
                          cancelMutation.mutate(appt.id);
                        }}
                        className="rounded-md border px-3 py-1 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                    ) : null}
                  </div>
                </div>

                {isOpen ? (
                  <div className="border-t px-4 pb-4 pt-3">
                    {appt.trainingProgress?.map((progress) => (
                      <div key={progress.id} className="mb-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Progreso de entrenamiento
                        </p>
                        <p className="mt-1 text-sm">{progress.notes}</p>
                        {Object.keys(progress.metrics ?? {}).length > 0 ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {Object.entries(progress.metrics).map(([key, val]) => (
                              <span
                                key={key}
                                className="rounded-full bg-muted px-2 py-0.5 text-xs"
                              >
                                {key}: {String(val)}
                              </span>
                            ))}
                          </div>
                        ) : null}
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(progress.createdAt).toLocaleDateString("es-PE")}
                        </p>
                      </div>
                    ))}

                    {appt.nutritionPlans?.map((plan) => (
                      <div key={plan.id} className="mb-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Plan nutricional
                        </p>
                        <p className="mt-1 text-sm font-medium">{plan.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(plan.createdAt).toLocaleDateString("es-PE")}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : null}
    </main>
  );
}
