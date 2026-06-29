"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { adminListRooms, adminToggleRoomStatus, type AdminRoom } from "@/services/admin-service";

type FeedbackState = { tone: "success" | "error"; text: string };

export default function AdminRoomsPage() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const roomsQuery = useQuery<AdminRoom[]>({
    queryKey: ["admin-rooms"],
    queryFn: () => adminListRooms(accessToken ?? ""),
    enabled: Boolean(accessToken)
  });

  const toggleMutation = useMutation({
    mutationFn: (roomId: string) => adminToggleRoomStatus(accessToken ?? "", roomId),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["admin-rooms"] });
      setFeedback({
        tone: "success",
        text: `Sala ${data.status === "active" ? "activada" : "inactivada"} correctamente.`
      });
    }
  });

  return (
    <main className="px-6 py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Salas</h1>
        <p className="mt-1 text-sm text-muted-foreground">Administra el estado de las salas de entrenamiento.</p>
      </header>

      {feedback ? (
        <p className={`mb-4 rounded-md border px-4 py-2 text-sm ${feedback.tone === "success" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700" : "border-destructive/30 bg-destructive/10 text-destructive"}`}>
          {feedback.text}
        </p>
      ) : null}

      {roomsQuery.isLoading ? <p className="text-sm text-muted-foreground">Cargando...</p> : null}

      {roomsQuery.data?.length ? (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full min-w-[500px] text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Sala</th>
                <th className="px-3 py-2 text-right font-semibold">Aforo</th>
                <th className="px-3 py-2 text-right font-semibold">Horarios</th>
                <th className="px-3 py-2 text-left font-semibold">Estado</th>
                <th className="px-3 py-2 font-semibold">Accion</th>
              </tr>
            </thead>
            <tbody>
              {roomsQuery.data.map((room: AdminRoom) => (
                <tr key={room.id} className="border-t hover:bg-muted/20">
                  <td className="px-3 py-2 font-medium">{room.name}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{room.capacity}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{room.schedulesCount}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${room.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"}`}>
                      {room.status === "active" ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      disabled={toggleMutation.isPending}
                      onClick={() => { setFeedback(null); toggleMutation.mutate(room.id); }}
                      className={`text-xs font-semibold ${room.status === "active" ? "text-destructive" : "text-emerald-600"}`}
                    >
                      {room.status === "active" ? "Inactivar" : "Activar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </main>
  );
}
