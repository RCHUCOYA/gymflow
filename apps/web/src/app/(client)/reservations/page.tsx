"use client";

import { isAxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { CalendarX, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import {
  cancelReservation,
  listMyReservations,
  type Reservation
} from "@/services/reservations-service";

type FeedbackState = {
  tone: "success" | "error";
  text: string;
};

function statusLabel(status: string) {
  switch (status) {
    case "confirmed":
      return "Confirmada";
    case "cancelled":
      return "Cancelada";
    default:
      return status;
  }
}

function StatusBadge({ status }: { status: string }) {
  const isConfirmed = status === "confirmed";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
        isConfirmed
          ? "bg-emerald-100 text-emerald-800"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {isConfirmed ? (
        <CheckCircle2 aria-hidden className="size-3" />
      ) : (
        <XCircle aria-hidden className="size-3" />
      )}
      {statusLabel(status)}
    </span>
  );
}

export default function ReservationsPage() {
  const { isAuthenticated, user, accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const reservationsQuery = useQuery<Reservation[]>({
    queryKey: ["my-reservations", user?.id],
    queryFn: () => listMyReservations(accessToken ?? ""),
    enabled: Boolean(accessToken && user?.role === "Cliente")
  });

  const cancelMutation = useMutation({
    mutationFn: (reservationId: string) =>
      cancelReservation({ accessToken: accessToken ?? "", reservationId }),
    onSuccess: () => {
      setFeedback({ tone: "success", text: "Reserva cancelada correctamente." });
      void queryClient.invalidateQueries({ queryKey: ["my-reservations", user?.id] });
    },
    onError: (error) => {
      const fallback = "No se pudo cancelar la reserva.";
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
          <CalendarX aria-hidden className="mx-auto size-12 text-muted-foreground" />
          <h1 className="mt-4 text-2xl font-bold">Debes iniciar sesion</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Accede a tu cuenta para ver y gestionar tus reservas.
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
          <h1 className="mt-4 text-2xl font-bold">Solo para Clientes</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Las reservas de sala son gestionadas exclusivamente por usuarios con rol Cliente.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Mis reservas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Historial de reservas de sala activas y canceladas.
        </p>
        <Link
          href="/salas"
          className="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Explorar salas
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

      {reservationsQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando reservas...</p>
      ) : null}

      {reservationsQuery.isError ? (
        <p className="text-sm text-destructive">No se pudieron cargar tus reservas.</p>
      ) : null}

      {!reservationsQuery.isLoading &&
      !reservationsQuery.isError &&
      reservationsQuery.data?.length === 0 ? (
        <section className="rounded-lg border bg-card p-8 text-center shadow-sm">
          <CalendarX aria-hidden className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            No tienes reservas registradas.{" "}
            <Link href="/salas" className="font-semibold text-primary">
              Reserva una sala ahora.
            </Link>
          </p>
        </section>
      ) : null}

      {reservationsQuery.data?.length ? (
        <div className="space-y-3">
          {reservationsQuery.data.map((reservation) => {
            const isFuture = new Date(reservation.roomSchedule.startsAt) > new Date();
            const canCancel = reservation.status === "confirmed" && isFuture;

            return (
              <article
                key={reservation.id}
                className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1">
                  <p className="font-semibold">{reservation.roomSchedule.room.name}</p>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock aria-hidden className="size-3.5" />
                    {new Date(reservation.roomSchedule.startsAt).toLocaleString("es-PE", {
                      dateStyle: "long",
                      timeStyle: "short"
                    })}
                    {" — "}
                    {new Date(reservation.roomSchedule.endsAt).toLocaleTimeString("es-PE", {
                      timeStyle: "short"
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={reservation.status} />
                  {canCancel ? (
                    <button
                      type="button"
                      disabled={cancelMutation.isPending}
                      onClick={() => {
                        setFeedback(null);
                        cancelMutation.mutate(reservation.id);
                      }}
                      className="rounded-md border px-3 py-1 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </main>
  );
}
