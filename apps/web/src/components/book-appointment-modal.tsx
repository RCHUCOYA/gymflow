"use client";

import { isAxiosError } from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { bookAppointment } from "@/services/professionals-service";

type Props = {
  professional: {
    id: string;
    type: "trainer" | "nutritionist";
    user: { firstName: string; lastName: string };
  };
  onClose: () => void;
};

type FeedbackState = {
  tone: "success" | "error";
  text: string;
};

function toLocalDatetimeValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function BookAppointmentModal({ professional, onClose }: Props) {
  const { accessToken, user } = useAuth();
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  const defaultEnd = new Date(tomorrow.getTime() + 60 * 60 * 1000);

  const [startsAt, setStartsAt] = useState(toLocalDatetimeValue(tomorrow));
  const [endsAt, setEndsAt] = useState(toLocalDatetimeValue(defaultEnd));

  const bookMutation = useMutation({
    mutationFn: () =>
      bookAppointment({
        accessToken: accessToken ?? "",
        professionalType: professional.type,
        professionalId: professional.id,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString()
      }),
    onSuccess: () => {
      setFeedback({ tone: "success", text: "Cita agendada correctamente." });
      void queryClient.invalidateQueries({ queryKey: ["my-appointments", user?.id] });
    },
    onError: (error) => {
      const fallback = "No se pudo agendar la cita.";
      const message = isAxiosError<{ error?: { message?: string } }>(error)
        ? error.response?.data?.error?.message ?? fallback
        : fallback;

      setFeedback({ tone: "error", text: message });
    }
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    >
      <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 id="book-modal-title" className="text-lg font-bold">
              Agendar cita
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {professional.user.firstName} {professional.user.lastName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-md p-1 hover:bg-muted"
          >
            <X aria-hidden className="size-4" />
          </button>
        </div>

        {feedback ? (
          <p
            className={`mt-4 rounded-md border px-4 py-3 text-sm ${
              feedback.tone === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                : "border-destructive/30 bg-destructive/10 text-destructive"
            }`}
          >
            {feedback.text}
          </p>
        ) : null}

        {feedback?.tone !== "success" ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setFeedback(null);
              bookMutation.mutate();
            }}
            className="mt-4 space-y-4"
          >
            <div>
              <label
                htmlFor="book-starts-at"
                className="block text-xs font-medium text-muted-foreground"
              >
                Inicio
              </label>
              <input
                id="book-starts-at"
                type="datetime-local"
                required
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="book-ends-at"
                className="block text-xs font-medium text-muted-foreground"
              >
                Fin
              </label>
              <input
                id="book-ends-at"
                type="datetime-local"
                required
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={bookMutation.isPending}
                className="flex-1 rounded-md bg-primary py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                {bookMutation.isPending ? "Agendando..." : "Confirmar cita"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border px-4 py-2 text-sm font-semibold"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full rounded-md border py-2 text-sm font-semibold"
          >
            Cerrar
          </button>
        )}
      </div>
    </div>
  );
}
