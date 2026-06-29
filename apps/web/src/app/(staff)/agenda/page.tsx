"use client";

import { isAxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { Calendar, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import {
  addNutritionPlan,
  addTrainingProgress,
  listStaffAppointments,
  type StaffAppointment
} from "@/services/professionals-service";

type FeedbackState = {
  tone: "success" | "error";
  text: string;
};

type ProgressFormState = {
  appointmentId: string;
  mode: "progress" | "nutrition";
};

function StatusBadge({ status }: { status: string }) {
  const isConfirmed = status === "confirmed";
  const Icon = isConfirmed ? CheckCircle2 : XCircle;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
        isConfirmed ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"
      }`}
    >
      <Icon aria-hidden className="size-3" />
      {isConfirmed ? "Confirmada" : "Cancelada"}
    </span>
  );
}

export default function StaffAgendaPage() {
  const { isAuthenticated, user, accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [form, setForm] = useState<ProgressFormState | null>(null);
  const [notes, setNotes] = useState("");
  const [planTitle, setPlanTitle] = useState("");
  const [planDescription, setPlanDescription] = useState("");

  const agendaQuery = useQuery<StaffAppointment[]>({
    queryKey: ["staff-appointments", user?.id],
    queryFn: () => listStaffAppointments(accessToken ?? ""),
    enabled: Boolean(accessToken && (user?.role === "Entrenador" || user?.role === "Nutricionista"))
  });

  const progressMutation = useMutation({
    mutationFn: () =>
      addTrainingProgress({
        accessToken: accessToken ?? "",
        appointmentId: form?.appointmentId ?? "",
        notes
      }),
    onSuccess: () => {
      setFeedback({ tone: "success", text: "Progreso registrado correctamente." });
      setForm(null);
      setNotes("");
      void queryClient.invalidateQueries({ queryKey: ["staff-appointments", user?.id] });
    },
    onError: (error) => {
      const fallback = "No se pudo registrar el progreso.";
      const message = isAxiosError<{ error?: { message?: string } }>(error)
        ? error.response?.data?.error?.message ?? fallback
        : fallback;

      setFeedback({ tone: "error", text: message });
    }
  });

  const nutritionMutation = useMutation({
    mutationFn: () =>
      addNutritionPlan({
        accessToken: accessToken ?? "",
        appointmentId: form?.appointmentId ?? "",
        title: planTitle,
        description: planDescription
      }),
    onSuccess: () => {
      setFeedback({ tone: "success", text: "Plan nutricional registrado correctamente." });
      setForm(null);
      setPlanTitle("");
      setPlanDescription("");
      void queryClient.invalidateQueries({ queryKey: ["staff-appointments", user?.id] });
    },
    onError: (error) => {
      const fallback = "No se pudo registrar el plan.";
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
          <Calendar aria-hidden className="mx-auto size-12 text-muted-foreground" />
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

  if (user.role !== "Entrenador" && user.role !== "Nutricionista") {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-6 py-12">
        <section className="w-full rounded-lg border bg-card p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold">Acceso restringido</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Esta seccion es exclusiva para Entrenadores y Nutricionistas.
          </p>
        </section>
      </main>
    );
  }

  const isTrainer = user.role === "Entrenador";

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Mi agenda</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isTrainer
            ? "Visualiza tus citas y registra progreso de cada cliente."
            : "Visualiza tus consultas y registra planes nutricionales."}
        </p>
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

      {agendaQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando agenda...</p>
      ) : null}

      {agendaQuery.isError ? (
        <p className="text-sm text-destructive">No se pudo cargar la agenda.</p>
      ) : null}

      {!agendaQuery.isLoading && !agendaQuery.isError && agendaQuery.data?.length === 0 ? (
        <section className="rounded-lg border bg-card p-8 text-center shadow-sm">
          <Calendar aria-hidden className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No tienes citas registradas todavia.</p>
        </section>
      ) : null}

      {agendaQuery.data?.length ? (
        <div className="space-y-4">
          {agendaQuery.data.map((appt) => (
            <article key={appt.id} className="rounded-lg border bg-card p-5 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-semibold">
                    {appt.client.firstName} {appt.client.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{appt.client.email}</p>
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock aria-hidden className="size-3.5" />
                    {new Date(appt.startsAt).toLocaleString("es-PE", { dateStyle: "long", timeStyle: "short" })}
                    {" — "}
                    {new Date(appt.endsAt).toLocaleTimeString("es-PE", { timeStyle: "short" })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={appt.status} />
                  {appt.status === "confirmed" ? (
                    <button
                      type="button"
                      onClick={() => {
                        setFeedback(null);
                        setForm({
                          appointmentId: appt.id,
                          mode: isTrainer ? "progress" : "nutrition"
                        });
                      }}
                      className="rounded-md border px-3 py-1 text-xs font-semibold"
                    >
                      {isTrainer ? "Agregar progreso" : "Agregar plan"}
                    </button>
                  ) : null}
                </div>
              </div>

              {appt.trainingProgress.length > 0 ? (
                <div className="mt-4 border-t pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Progresos registrados ({appt.trainingProgress.length})
                  </p>
                  {appt.trainingProgress.map((progress) => (
                    <div key={progress.id} className="mt-2">
                      <p className="text-sm">{progress.notes}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {new Date(progress.createdAt).toLocaleDateString("es-PE")}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}

              {appt.nutritionPlans.length > 0 ? (
                <div className="mt-4 border-t pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Planes nutricionales ({appt.nutritionPlans.length})
                  </p>
                  {appt.nutritionPlans.map((plan) => (
                    <div key={plan.id} className="mt-2">
                      <p className="text-sm font-medium">{plan.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {new Date(plan.createdAt).toLocaleDateString("es-PE")}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}

      {form ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="form-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        >
          <div className="w-full max-w-lg rounded-lg border bg-card p-6 shadow-xl">
            <h2 id="form-modal-title" className="text-lg font-bold">
              {form.mode === "progress" ? "Registrar progreso" : "Registrar plan nutricional"}
            </h2>

            {form.mode === "progress" ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  progressMutation.mutate();
                }}
                className="mt-4 space-y-4"
              >
                <div>
                  <label htmlFor="progress-notes" className="block text-xs font-medium text-muted-foreground">
                    Observaciones
                  </label>
                  <textarea
                    id="progress-notes"
                    required
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Describe el progreso del cliente en esta sesion..."
                    className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={progressMutation.isPending}
                    className="flex-1 rounded-md bg-primary py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                  >
                    {progressMutation.isPending ? "Guardando..." : "Guardar progreso"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(null)}
                    className="rounded-md border px-4 py-2 text-sm font-semibold"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  nutritionMutation.mutate();
                }}
                className="mt-4 space-y-4"
              >
                <div>
                  <label htmlFor="plan-title" className="block text-xs font-medium text-muted-foreground">
                    Titulo del plan
                  </label>
                  <input
                    id="plan-title"
                    type="text"
                    required
                    value={planTitle}
                    onChange={(e) => setPlanTitle(e.target.value)}
                    placeholder="Plan de ganancia muscular"
                    className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="plan-desc" className="block text-xs font-medium text-muted-foreground">
                    Descripcion
                  </label>
                  <textarea
                    id="plan-desc"
                    required
                    rows={4}
                    value={planDescription}
                    onChange={(e) => setPlanDescription(e.target.value)}
                    placeholder="Detalla el plan nutricional del cliente..."
                    className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={nutritionMutation.isPending}
                    className="flex-1 rounded-md bg-primary py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                  >
                    {nutritionMutation.isPending ? "Guardando..." : "Guardar plan"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(null)}
                    className="rounded-md border px-4 py-2 text-sm font-semibold"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </main>
  );
}
