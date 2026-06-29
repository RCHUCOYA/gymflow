import assert from "node:assert/strict";
import test from "node:test";
import request from "supertest";
import { createApp } from "../../app.js";

const app = createApp();

type ApiSuccess<T> = {
  success: boolean;
  data: T;
};

type RoomItem = {
  id: string;
  name: string;
  capacity: number;
  status: string;
};

type ScheduleItem = {
  id: string;
  roomId: string;
  startsAt: string;
  endsAt: string;
  quota: number;
  confirmedCount: number;
  availableSlots: number;
};

function bodyOf<T>(response: request.Response) {
  return response.body as T;
}

void test("listado de salas devuelve salas activas ordenadas por nombre", async () => {
  const response = await request(app).get("/api/v1/rooms");
  const body = bodyOf<ApiSuccess<RoomItem[]>>(response);

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.ok(body.data.length > 0);
  assert.ok(body.data.every((room) => room.status === "active"));

  const names = body.data.map((room) => room.name);
  const sorted = [...names].sort((left, right) => left.localeCompare(right));

  assert.deepEqual(names, sorted);
});

void test("listado de horarios devuelve horarios futuros con slots disponibles calculados", async () => {
  const roomsResponse = await request(app).get("/api/v1/rooms");
  const rooms = bodyOf<ApiSuccess<RoomItem[]>>(roomsResponse).data;

  assert.ok(rooms.length > 0);

  const room = rooms[0];

  assert.ok(room);

  const response = await request(app).get(`/api/v1/rooms/${room.id}/schedules`);
  const body = bodyOf<ApiSuccess<ScheduleItem[]>>(response);

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.ok(Array.isArray(body.data));

  for (const schedule of body.data) {
    assert.equal(schedule.roomId, room.id);
    assert.equal(typeof schedule.quota, "number");
    assert.equal(typeof schedule.confirmedCount, "number");
    assert.equal(schedule.availableSlots, schedule.quota - schedule.confirmedCount);
    assert.ok(new Date(schedule.startsAt) >= new Date());
  }
});

void test("horarios de sala inexistente devuelve 404", async () => {
  const response = await request(app).get(
    "/api/v1/rooms/00000000-0000-4000-8000-000000000000/schedules"
  );

  assert.equal(response.status, 404);
  assert.equal(bodyOf<{ success: boolean }>(response).success, false);
});
