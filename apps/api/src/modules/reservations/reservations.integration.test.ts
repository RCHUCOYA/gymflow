import assert from "node:assert/strict";
import test from "node:test";
import { MembershipStatus } from "@prisma/client";
import request from "supertest";
import { createApp } from "../../app.js";
import { prisma } from "../../prisma/client.js";

const app = createApp();

type ApiSuccess<T> = {
  success: boolean;
  data: T;
};

type ReservationResult = {
  id: string;
  status: string;
  roomSchedule: {
    id: string;
    startsAt: string;
    endsAt: string;
    room: { id: string; name: string };
  };
  createdAt: string;
};

type CancelResult = {
  id: string;
  status: string;
  updatedAt: string;
};

function bodyOf<T>(response: request.Response) {
  return response.body as T;
}

async function registerClient() {
  const email = `reservation-${Date.now()}-${Math.random().toString(36).slice(2)}@gymflow.dev`;
  const response = await request(app).post("/api/v1/auth/register").send({
    firstName: "Reservation",
    lastName: "Tester",
    email,
    password: "Password123",
    phone: "+51999999998"
  });

  assert.equal(response.status, 201);

  const data = bodyOf<ApiSuccess<{ accessToken: string; user: { id: string } }>>(response).data;

  return {
    token: data.accessToken,
    userId: data.user.id
  };
}

async function cleanupUser(userId: string) {
  await prisma.reservation.deleteMany({ where: { userId } });
  await prisma.userMembership.deleteMany({ where: { userId } });
  await prisma.payment.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { id: userId } });
}

async function grantActiveMembership(userId: string) {
  const plan = await prisma.membershipPlan.findUnique({ where: { name: "Mensual" } });

  assert.ok(plan?.id);

  const now = new Date();

  return prisma.userMembership.create({
    data: {
      userId,
      membershipPlanId: plan.id,
      startsAt: now,
      endsAt: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate())),
      status: MembershipStatus.active
    }
  });
}

async function getFirstFutureSchedule() {
  const schedule = await prisma.roomSchedule.findFirst({
    where: {
      status: "active",
      startsAt: { gte: new Date() }
    },
    orderBy: { startsAt: "asc" }
  });

  assert.ok(schedule, "No hay horarios futuros en la base de datos");

  return schedule;
}

void test("crear reserva requiere autenticacion", async () => {
  const schedule = await getFirstFutureSchedule();

  const response = await request(app).post("/api/v1/reservations").send({
    roomScheduleId: schedule.id
  });

  assert.equal(response.status, 401);
  assert.equal(bodyOf<{ success: boolean }>(response).success, false);
});

void test("crear reserva sin membresia activa devuelve 422", async () => {
  const client = await registerClient();
  const schedule = await getFirstFutureSchedule();

  try {
    const response = await request(app)
      .post("/api/v1/reservations")
      .set("authorization", `Bearer ${client.token}`)
      .send({ roomScheduleId: schedule.id });

    assert.equal(response.status, 422);

    const body = bodyOf<{ success: boolean; error: { code: string } }>(response);

    assert.equal(body.success, false);
    assert.equal(body.error.code, "BUSINESS_RULE_ERROR");
  } finally {
    await cleanupUser(client.userId);
  }
});

void test("crear reserva con membresia activa devuelve 201 y los datos correctos", async () => {
  const client = await registerClient();
  const schedule = await getFirstFutureSchedule();

  try {
    await grantActiveMembership(client.userId);

    const response = await request(app)
      .post("/api/v1/reservations")
      .set("authorization", `Bearer ${client.token}`)
      .send({ roomScheduleId: schedule.id });

    const body = bodyOf<ApiSuccess<ReservationResult>>(response);

    assert.equal(response.status, 201);
    assert.equal(body.success, true);
    assert.equal(body.data.status, "confirmed");
    assert.equal(body.data.roomSchedule.id, schedule.id);
    assert.equal(typeof body.data.roomSchedule.room.name, "string");
  } finally {
    await cleanupUser(client.userId);
  }
});

void test("crear reserva duplicada devuelve 409", async () => {
  const client = await registerClient();
  const schedule = await getFirstFutureSchedule();

  try {
    await grantActiveMembership(client.userId);

    await request(app)
      .post("/api/v1/reservations")
      .set("authorization", `Bearer ${client.token}`)
      .send({ roomScheduleId: schedule.id });

    const response = await request(app)
      .post("/api/v1/reservations")
      .set("authorization", `Bearer ${client.token}`)
      .send({ roomScheduleId: schedule.id });

    assert.equal(response.status, 409);
    assert.equal(bodyOf<{ success: boolean; error: { code: string } }>(response).error.code, "CONFLICT");
  } finally {
    await cleanupUser(client.userId);
  }
});

void test("listar mis reservas devuelve solo las del cliente autenticado", async () => {
  const clientA = await registerClient();
  const clientB = await registerClient();
  const schedule = await getFirstFutureSchedule();

  try {
    await grantActiveMembership(clientA.userId);

    await request(app)
      .post("/api/v1/reservations")
      .set("authorization", `Bearer ${clientA.token}`)
      .send({ roomScheduleId: schedule.id });

    const responseA = await request(app)
      .get("/api/v1/reservations/me")
      .set("authorization", `Bearer ${clientA.token}`);
    const bodyA = bodyOf<ApiSuccess<ReservationResult[]>>(responseA);

    assert.equal(responseA.status, 200);
    assert.ok(bodyA.data.length >= 1);
    assert.ok(bodyA.data.every((r) => r.roomSchedule));

    const responseB = await request(app)
      .get("/api/v1/reservations/me")
      .set("authorization", `Bearer ${clientB.token}`);
    const bodyB = bodyOf<ApiSuccess<ReservationResult[]>>(responseB);

    assert.equal(responseB.status, 200);
    assert.equal(bodyB.data.length, 0);
  } finally {
    await cleanupUser(clientA.userId);
    await cleanupUser(clientB.userId);
  }
});

void test("cancelar reserva propia antes del inicio devuelve 200", async () => {
  const client = await registerClient();
  const schedule = await getFirstFutureSchedule();

  try {
    await grantActiveMembership(client.userId);

    const createResponse = await request(app)
      .post("/api/v1/reservations")
      .set("authorization", `Bearer ${client.token}`)
      .send({ roomScheduleId: schedule.id });

    const reservationId = bodyOf<ApiSuccess<ReservationResult>>(createResponse).data.id;

    const cancelResponse = await request(app)
      .patch(`/api/v1/reservations/${reservationId}/cancel`)
      .set("authorization", `Bearer ${client.token}`);
    const cancelBody = bodyOf<ApiSuccess<CancelResult>>(cancelResponse);

    assert.equal(cancelResponse.status, 200);
    assert.equal(cancelBody.data.status, "cancelled");
  } finally {
    await cleanupUser(client.userId);
  }
});

void test("cancelar reserva de otro usuario devuelve 403", async () => {
  const clientA = await registerClient();
  const clientB = await registerClient();
  const schedule = await getFirstFutureSchedule();

  try {
    await grantActiveMembership(clientA.userId);

    const createResponse = await request(app)
      .post("/api/v1/reservations")
      .set("authorization", `Bearer ${clientA.token}`)
      .send({ roomScheduleId: schedule.id });

    const reservationId = bodyOf<ApiSuccess<ReservationResult>>(createResponse).data.id;

    const cancelResponse = await request(app)
      .patch(`/api/v1/reservations/${reservationId}/cancel`)
      .set("authorization", `Bearer ${clientB.token}`);

    assert.equal(cancelResponse.status, 403);
  } finally {
    await cleanupUser(clientA.userId);
    await cleanupUser(clientB.userId);
  }
});

void test("cancelar reserva ya cancelada devuelve 422", async () => {
  const client = await registerClient();
  const schedule = await getFirstFutureSchedule();

  try {
    await grantActiveMembership(client.userId);

    const createResponse = await request(app)
      .post("/api/v1/reservations")
      .set("authorization", `Bearer ${client.token}`)
      .send({ roomScheduleId: schedule.id });

    const reservationId = bodyOf<ApiSuccess<ReservationResult>>(createResponse).data.id;

    await request(app)
      .patch(`/api/v1/reservations/${reservationId}/cancel`)
      .set("authorization", `Bearer ${client.token}`);

    const secondCancel = await request(app)
      .patch(`/api/v1/reservations/${reservationId}/cancel`)
      .set("authorization", `Bearer ${client.token}`);

    assert.equal(secondCancel.status, 422);
  } finally {
    await cleanupUser(client.userId);
  }
});
