import { apiClient } from "@/lib/api-client";

export type Reservation = {
  id: string;
  status: string;
  roomSchedule: {
    id: string;
    startsAt: string;
    endsAt: string;
    room: {
      id: string;
      name: string;
    };
  };
  createdAt: string;
};

type ApiSuccess<T> = {
  success: true;
  data: T;
  message: string;
};

export async function createReservation(input: {
  accessToken: string;
  roomScheduleId: string;
}) {
  const response = await apiClient.post<ApiSuccess<Reservation>>(
    "/reservations",
    { roomScheduleId: input.roomScheduleId },
    { headers: { Authorization: `Bearer ${input.accessToken}` } }
  );

  return response.data.data;
}

export async function listMyReservations(accessToken: string) {
  const response = await apiClient.get<ApiSuccess<Reservation[]>>("/reservations/me", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  return response.data.data;
}

export async function cancelReservation(input: {
  accessToken: string;
  reservationId: string;
}) {
  const response = await apiClient.patch<ApiSuccess<{ id: string; status: string }>>(
    `/reservations/${input.reservationId}/cancel`,
    null,
    { headers: { Authorization: `Bearer ${input.accessToken}` } }
  );

  return response.data.data;
}
