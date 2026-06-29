import { apiClient } from "@/lib/api-client";

export type Room = {
  id: string;
  name: string;
  capacity: number;
  status: string;
};

export type RoomSchedule = {
  id: string;
  roomId: string;
  startsAt: string;
  endsAt: string;
  quota: number;
  confirmedCount: number;
  availableSlots: number;
};

type ApiSuccess<T> = {
  success: true;
  data: T;
  message: string;
};

export async function listRooms() {
  const response = await apiClient.get<ApiSuccess<Room[]>>("/rooms");
  return response.data.data;
}

export async function listRoomSchedules(roomId: string) {
  const response = await apiClient.get<ApiSuccess<RoomSchedule[]>>(`/rooms/${roomId}/schedules`);
  return response.data.data;
}
