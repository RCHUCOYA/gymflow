import assert from "node:assert/strict";
import test from "node:test";
import { MembershipStatus, ProfessionalType } from "@prisma/client";
import request from "supertest";
import { createApp } from "../../app.js";
import { prisma } from "../../prisma/client.js";

const app = createApp();

type ApiSuccess<T> = {
  success: boolean;
  data: T;
};

type ProfessionalItem = {
  id: string;
  type: string;
  specialty: string | null;
  bio: string | null;
  user: { id: string; firstName: string; lastName: string };
};

type AppointmentResult = {
  id: string;
  status: string;
  startsAt: string;
  endsAt: string;
  professional: { id: string; type: string; user: { id: string; firstName: string; lastName: string } };
  createdAt: string;
};

function bodyOf<T>(response: request.Response) {
  return response.body as T;
}

async function registerClient() {
  const email = `prof-test-${Date.now()}-${Math.random().toString(36).slice(2)}@gymflow.dev`;
  const res = await request(app).post("/api/v1/auth/register").send({
    firstName: "Prof",
    lastName: "Tester",
    email,
    password: "Password123",
    phone: "+51999999997"
  });

  assert.equal(res.status, 201);

  const data = bodyOf<ApiSuccess<{ accessToken: string; user: { id: string } }>>(res).data;

  return { token: data.accessToken, userId: data.user.id };
}

async function cleanupUser(userId: string) {
  await prisma.trainingProgress.deleteMany({
    where: { appointment: { clientId: userId } }
  });
  await prisma.nutritionPlan.deleteMany({
    where: { appointment: { clientId: userId } }
  });
  await prisma.appointment.deleteMany({ where: { clientId: userId } });
  await prisma.userMembership.deleteMany({ where: { userId } });
  await prisma.payment.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { id: userId } });
}

async function grantMembership(userId: string, planName: string) {
  const plan = await prisma.membershipPlan.findUnique({ where: { name: planName } });
  assert.ok(plan?.id, `Plan ${planName} no encontrado`);

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

function futureSlot(daysFromNow = 5, durationHours = 1) {
  const startsAt = new Date();
  startsAt.setUTCDate(startsAt.getUTCDate() + daysFromNow);
  startsAt.setUTCHours(10, 0, 0, 0);
  const endsAt = new Date(startsAt.getTime() + durationHours * 60 * 60 * 1000);

  return {
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString()
  };
}

async function getProfile(type: ProfessionalType) {
  const profile = await prisma.professionalProfile.findFirst({
    where: { type, status: "active" }
  });

  assert.ok(profile?.id, `No hay perfil de tipo ${type} en el seed`);

  return profile;
}

// ─── Public listings ──────────────────────────────────────────────────────────

void test("listar entrenadores devuelve perfiles activos con datos de usuario", async () => {
  const response = await request(app).get("/api/v1/trainers");
  const body = bodyOf<ApiSuccess<ProfessionalItem[]>>(response);

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.ok(body.data.length >= 1);
  assert.ok(body.data.every((p) => p.type === "trainer"));
  assert.ok(body.data.every((p) => typeof p.user.firstName === "string"));
});

void test("listar nutricionistas devuelve perfiles activos", async () => {
  const response = await request(app).get("/api/v1/nutritionists");
  const body = bodyOf<ApiSuccess<ProfessionalItem[]>>(response);

  assert.equal(response.status, 200);
  assert.ok(body.data.every((p) => p.type === "nutritionist"));
});

// ─── Booking trainer ─────────────────────────────────────────────────────────

void test("reservar entrenador sin membresia activa devuelve 422", async () => {
  const client = await registerClient();
  const trainer = await getProfile(ProfessionalType.trainer);

  try {
    const response = await request(app)
      .post(`/api/v1/trainers/${trainer.id}/appointments`)
      .set("authorization", `Bearer ${client.token}`)
      .send(futureSlot());

    assert.equal(response.status, 422);
    assert.equal(bodyOf<{ error: { code: string } }>(response).error.code, "BUSINESS_RULE_ERROR");
  } finally {
    await cleanupUser(client.userId);
  }
});

void test("reservar entrenador con plan Mensual (sin beneficio) devuelve 422", async () => {
  const client = await registerClient();
  const trainer = await getProfile(ProfessionalType.trainer);

  try {
    await grantMembership(client.userId, "Mensual");

    const response = await request(app)
      .post(`/api/v1/trainers/${trainer.id}/appointments`)
      .set("authorization", `Bearer ${client.token}`)
      .send(futureSlot());

    assert.equal(response.status, 422);
    assert.equal(bodyOf<{ error: { code: string } }>(response).error.code, "BUSINESS_RULE_ERROR");
  } finally {
    await cleanupUser(client.userId);
  }
});

void test("reservar entrenador con plan Premium (con beneficio) devuelve 201", async () => {
  const client = await registerClient();
  const trainer = await getProfile(ProfessionalType.trainer);

  try {
    await grantMembership(client.userId, "Premium");
    const slot = futureSlot(3);

    const response = await request(app)
      .post(`/api/v1/trainers/${trainer.id}/appointments`)
      .set("authorization", `Bearer ${client.token}`)
      .send(slot);

    const body = bodyOf<ApiSuccess<AppointmentResult>>(response);

    assert.equal(response.status, 201);
    assert.equal(body.success, true);
    assert.equal(body.data.status, "confirmed");
    assert.equal(body.data.professional.type, "trainer");
  } finally {
    await cleanupUser(client.userId);
  }
});

// ─── Booking nutritionist ─────────────────────────────────────────────────────

void test("reservar nutricionista con plan Mensual devuelve 422", async () => {
  const client = await registerClient();
  const nutritionist = await getProfile(ProfessionalType.nutritionist);

  try {
    await grantMembership(client.userId, "Mensual");

    const response = await request(app)
      .post(`/api/v1/nutritionists/${nutritionist.id}/appointments`)
      .set("authorization", `Bearer ${client.token}`)
      .send(futureSlot());

    assert.equal(response.status, 422);
  } finally {
    await cleanupUser(client.userId);
  }
});

void test("reservar nutricionista con plan VIP devuelve 201", async () => {
  const client = await registerClient();
  const nutritionist = await getProfile(ProfessionalType.nutritionist);

  try {
    await grantMembership(client.userId, "VIP");
    const slot = futureSlot(4);

    const response = await request(app)
      .post(`/api/v1/nutritionists/${nutritionist.id}/appointments`)
      .set("authorization", `Bearer ${client.token}`)
      .send(slot);

    assert.equal(response.status, 201);
    assert.equal(bodyOf<ApiSuccess<AppointmentResult>>(response).data.professional.type, "nutritionist");
  } finally {
    await cleanupUser(client.userId);
  }
});

// ─── Double booking ───────────────────────────────────────────────────────────

void test("doble reserva en el mismo horario del profesional devuelve 409", async () => {
  const clientA = await registerClient();
  const clientB = await registerClient();
  const trainer = await getProfile(ProfessionalType.trainer);

  try {
    await Promise.all([
      grantMembership(clientA.userId, "Premium"),
      grantMembership(clientB.userId, "Premium")
    ]);

    const slot = futureSlot(6);

    const firstResponse = await request(app)
      .post(`/api/v1/trainers/${trainer.id}/appointments`)
      .set("authorization", `Bearer ${clientA.token}`)
      .send(slot);

    assert.equal(firstResponse.status, 201);

    const secondResponse = await request(app)
      .post(`/api/v1/trainers/${trainer.id}/appointments`)
      .set("authorization", `Bearer ${clientB.token}`)
      .send(slot);

    assert.equal(secondResponse.status, 409);
    assert.equal(bodyOf<{ error: { code: string } }>(secondResponse).error.code, "CONFLICT");
  } finally {
    await cleanupUser(clientA.userId);
    await cleanupUser(clientB.userId);
  }
});

// ─── My appointments ──────────────────────────────────────────────────────────

void test("listar mis citas devuelve solo las del cliente autenticado", async () => {
  const clientA = await registerClient();
  const clientB = await registerClient();
  const trainer = await getProfile(ProfessionalType.trainer);

  try {
    await grantMembership(clientA.userId, "Premium");

    await request(app)
      .post(`/api/v1/trainers/${trainer.id}/appointments`)
      .set("authorization", `Bearer ${clientA.token}`)
      .send(futureSlot(7));

    const responseA = await request(app)
      .get("/api/v1/appointments/me")
      .set("authorization", `Bearer ${clientA.token}`);
    const bodyA = bodyOf<ApiSuccess<AppointmentResult[]>>(responseA);

    assert.equal(responseA.status, 200);
    assert.ok(bodyA.data.length >= 1);

    const responseB = await request(app)
      .get("/api/v1/appointments/me")
      .set("authorization", `Bearer ${clientB.token}`);
    const bodyB = bodyOf<ApiSuccess<AppointmentResult[]>>(responseB);

    assert.equal(responseB.status, 200);
    assert.equal(bodyB.data.length, 0);
  } finally {
    await cleanupUser(clientA.userId);
    await cleanupUser(clientB.userId);
  }
});

// ─── Cancel ──────────────────────────────────────────────────────────────────

void test("cancelar cita propia antes del inicio devuelve 200", async () => {
  const client = await registerClient();
  const trainer = await getProfile(ProfessionalType.trainer);

  try {
    await grantMembership(client.userId, "Premium");

    const bookRes = await request(app)
      .post(`/api/v1/trainers/${trainer.id}/appointments`)
      .set("authorization", `Bearer ${client.token}`)
      .send(futureSlot(8));

    const appointmentId = bodyOf<ApiSuccess<AppointmentResult>>(bookRes).data.id;

    const cancelRes = await request(app)
      .patch(`/api/v1/appointments/${appointmentId}/cancel`)
      .set("authorization", `Bearer ${client.token}`);

    assert.equal(cancelRes.status, 200);
    assert.equal(bodyOf<ApiSuccess<{ status: string }>>(cancelRes).data.status, "cancelled");
  } finally {
    await cleanupUser(client.userId);
  }
});

void test("cancelar cita ya cancelada devuelve 422", async () => {
  const client = await registerClient();
  const trainer = await getProfile(ProfessionalType.trainer);

  try {
    await grantMembership(client.userId, "Premium");

    const bookRes = await request(app)
      .post(`/api/v1/trainers/${trainer.id}/appointments`)
      .set("authorization", `Bearer ${client.token}`)
      .send(futureSlot(9));

    const appointmentId = bodyOf<ApiSuccess<AppointmentResult>>(bookRes).data.id;

    await request(app)
      .patch(`/api/v1/appointments/${appointmentId}/cancel`)
      .set("authorization", `Bearer ${client.token}`);

    const second = await request(app)
      .patch(`/api/v1/appointments/${appointmentId}/cancel`)
      .set("authorization", `Bearer ${client.token}`);

    assert.equal(second.status, 422);
  } finally {
    await cleanupUser(client.userId);
  }
});

// ─── Staff & Progress ─────────────────────────────────────────────────────────

void test("entrenador puede registrar progreso en su cita", async () => {
  const client = await registerClient();

  const trainerUser = await prisma.user.findUnique({ where: { email: "trainer@gymflow.dev" } });
  assert.ok(trainerUser?.id);

  const trainerProfile = await getProfile(ProfessionalType.trainer);

  try {
    await grantMembership(client.userId, "Premium");

    const now = new Date();
    const appointmentStart = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
    const appointmentEnd = new Date(appointmentStart.getTime() + 60 * 60 * 1000);

    const appointment = await prisma.appointment.create({
      data: {
        clientId: client.userId,
        professionalProfileId: trainerProfile.id,
        startsAt: appointmentStart,
        endsAt: appointmentEnd,
        status: "confirmed"
      }
    });

    const trainerLoginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "trainer@gymflow.dev", password: "Password123" });

    const trainerToken = bodyOf<ApiSuccess<{ accessToken: string }>>(trainerLoginRes).data.accessToken;

    const progressRes = await request(app)
      .post(`/api/v1/appointments/${appointment.id}/progress`)
      .set("authorization", `Bearer ${trainerToken}`)
      .send({
        notes: "Buen rendimiento en sentadillas. Aumentar peso la proxima sesion.",
        metrics: { weight: 75, reps: 12, sets: 4 }
      });

    assert.equal(progressRes.status, 201);
    assert.equal(typeof bodyOf<ApiSuccess<{ id: string }>>(progressRes).data.id, "string");
  } finally {
    await cleanupUser(client.userId);
  }
});

void test("nutricionista puede registrar plan nutricional en su cita", async () => {
  const client = await registerClient();
  const nutritionistProfile = await getProfile(ProfessionalType.nutritionist);

  try {
    await grantMembership(client.userId, "VIP");

    const now = new Date();
    const appointmentStart = new Date(now.getTime() + 11 * 24 * 60 * 60 * 1000);
    const appointmentEnd = new Date(appointmentStart.getTime() + 60 * 60 * 1000);

    const appointment = await prisma.appointment.create({
      data: {
        clientId: client.userId,
        professionalProfileId: nutritionistProfile.id,
        startsAt: appointmentStart,
        endsAt: appointmentEnd,
        status: "confirmed"
      }
    });

    const nutri = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "nutri@gymflow.dev", password: "Password123" });

    const nutriToken = bodyOf<ApiSuccess<{ accessToken: string }>>(nutri).data.accessToken;

    const planRes = await request(app)
      .post(`/api/v1/appointments/${appointment.id}/nutrition-plan`)
      .set("authorization", `Bearer ${nutriToken}`)
      .send({
        title: "Plan de ganancia muscular",
        description: "Dieta hiperproteica con 2.2g proteina por kg. Distribuir en 5 comidas."
      });

    assert.equal(planRes.status, 201);
    assert.equal(typeof bodyOf<ApiSuccess<{ id: string }>>(planRes).data.id, "string");
  } finally {
    await cleanupUser(client.userId);
  }
});

void test("cliente no puede registrar progreso (403)", async () => {
  const client = await registerClient();
  const fakeId = "00000000-0000-4000-8000-000000000001";

  try {
    const response = await request(app)
      .post(`/api/v1/appointments/${fakeId}/progress`)
      .set("authorization", `Bearer ${client.token}`)
      .send({ notes: "intento no autorizado" });

    assert.equal(response.status, 403);
  } finally {
    await cleanupUser(client.userId);
  }
});

void test("staff agenda devuelve citas del profesional autenticado", async () => {
  const trainerLoginRes = await request(app)
    .post("/api/v1/auth/login")
    .send({ email: "trainer@gymflow.dev", password: "Password123" });

  const trainerToken = bodyOf<ApiSuccess<{ accessToken: string }>>(trainerLoginRes).data.accessToken;

  const response = await request(app)
    .get("/api/v1/staff/appointments")
    .set("authorization", `Bearer ${trainerToken}`);

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(bodyOf<ApiSuccess<unknown[]>>(response).data));
});
