"use client";

import { isAxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronDown, ChevronUp, Users } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { listRooms, listRoomSchedules, type Room, type RoomSchedule } from "@/services/rooms-service";
import { createReservation } from "@/services/reservations-service";

type FeedbackState = {
  tone: "success" | "error";
  text: string;
};

type ExpandedSchedule = {
  roomId: string;
  schedules: RoomSchedule[];
};

export function RoomsClientPage() {
  const { isAuthenticated, user, accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState<ExpandedSchedule | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  const roomsQuery = useQuery<Room[]>({
    queryKey: ["rooms"],
    queryFn: listRooms
  });

  const reserveMutation = useMutation({
    mutationFn: (roomScheduleId: string) =>
      createReservation({
        accessToken: accessToken ?? "",
        roomScheduleId
      }),
    onSuccess: () => {
      setFeedback({ tone: "success", text: "Reserva creada correctamente. Puedes verla en Mis reservas." });
      void queryClient.invalidateQueries({ queryKey: ["my-reservations", user?.id] });

      if (expanded) {
        void refreshSchedules(expanded.roomId);
      }
    },
    onError: (error) => {
      const fallback = "No se pudo crear la reserva.";
      const message = isAxiosError<{ error?: { message?: string } }>(error)
        ? error.response?.data?.error?.message ?? fallback
        : fallback;

      setFeedback({ tone: "error", text: message });
    }
  });

  async function toggleRoom(room: Room) {
    if (expanded?.roomId === room.id) {
      setExpanded(null);
      return;
    }

    setFeedback(null);
    await refreshSchedules(room.id);
  }

  async function refreshSchedules(roomId: string) {
    setLoadingSchedules(true);

    try {
      const schedules = await listRoomSchedules(roomId);
      setExpanded({ roomId, schedules });
    } catch {
      setFeedback({ tone: "error", text: "No se pudieron cargar los horarios de esta sala." });
      setExpanded(null);
    } finally {
      setLoadingSchedules(false);
    }
  }

  const canReserve = Boolean(accessToken) && user?.role === "Cliente";

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <header className="mb-8 max-w-3xl">
        <h1 className="text-3xl font-bold">Salas y horarios</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Explora las salas disponibles y reserva un horario con tu membresia activa.
        </p>
      </header>

      {isAuthenticated && user?.role !== "Cliente" ? (
        <div className="mb-6 rounded-md border bg-card p-4 text-sm text-muted-foreground">
          Solo el rol Cliente puede reservar salas desde esta pantalla.
        </div>
      ) : null}

      {!isAuthenticated ? (
        <div className="mb-6 rounded-md border bg-card p-4 text-sm">
          Inicia sesion como Cliente para reservar horarios.
        </div>
      ) : null}

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

      {roomsQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando salas...</p>
      ) : null}

      {roomsQuery.isError ? (
        <p className="text-sm text-destructive">No se pudieron cargar las salas.</p>
      ) : null}

      {!roomsQuery.isLoading && !roomsQuery.isError && roomsQuery.data?.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay salas disponibles actualmente.</p>
      ) : null}

      {roomsQuery.data?.length ? (
        <div className="space-y-4">
          {roomsQuery.data.map((room) => {
            const isOpen = expanded?.roomId === room.id;

            return (
              <article key={room.id} className="rounded-lg border bg-card shadow-sm">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  onClick={() => void toggleRoom(room)}
                  aria-expanded={isOpen}
                  aria-controls={`schedules-${room.id}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold">{room.name}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users aria-hidden className="size-3.5" />
                      Aforo: {room.capacity}
                    </span>
                  </div>
                  {isOpen ? (
                    <ChevronUp aria-hidden className="size-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronDown aria-hidden className="size-4 shrink-0 text-muted-foreground" />
                  )}
                </button>

                {isOpen ? (
                  <div id={`schedules-${room.id}`} className="border-t px-5 pb-5 pt-4">
                    {loadingSchedules ? (
                      <p className="text-sm text-muted-foreground">Cargando horarios...</p>
                    ) : expanded?.schedules.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No hay horarios futuros disponibles para esta sala.
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b text-left text-xs text-muted-foreground">
                              <th className="pb-2 pr-4 font-medium">Inicio</th>
                              <th className="pb-2 pr-4 font-medium">Fin</th>
                              <th className="pb-2 pr-4 font-medium">Cupos</th>
                              <th className="pb-2 font-medium">Accion</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {expanded?.schedules.map((schedule) => {
                              const isFull = schedule.availableSlots <= 0;

                              return (
                                <tr key={schedule.id} className="py-2">
                                  <td className="py-2 pr-4 tabular-nums">
                                    {new Date(schedule.startsAt).toLocaleString("es-PE", {
                                      dateStyle: "short",
                                      timeStyle: "short"
                                    })}
                                  </td>
                                  <td className="py-2 pr-4 tabular-nums">
                                    {new Date(schedule.endsAt).toLocaleString("es-PE", {
                                      dateStyle: "short",
                                      timeStyle: "short"
                                    })}
                                  </td>
                                  <td className="py-2 pr-4">
                                    <span
                                      className={`font-semibold ${isFull ? "text-destructive" : "text-emerald-600"}`}
                                    >
                                      {schedule.availableSlots}
                                    </span>
                                    <span className="text-muted-foreground"> / {schedule.quota}</span>
                                  </td>
                                  <td className="py-2">
                                    <button
                                      type="button"
                                      disabled={
                                        isFull ||
                                        !canReserve ||
                                        reserveMutation.isPending
                                      }
                                      onClick={() => {
                                        setFeedback(null);
                                        reserveMutation.mutate(schedule.id);
                                      }}
                                      className="rounded-md border px-3 py-1 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      {isFull ? "Sin cupo" : "Reservar"}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
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
