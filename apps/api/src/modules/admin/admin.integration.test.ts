import assert from "node:assert/strict";
import test from "node:test";
import request from "supertest";
import { createApp } from "../../app.js";
import { prisma } from "../../prisma/client.js";

const app = createApp();

type ApiSuccess<T> = { success: boolean; data: T };

function bodyOf<T>(res: request.Response) {
  return res.body as T;
}

async function loginAdmin() {
  const res = await request(app)
    .post("/api/v1/auth/login")
    .send({ email: "admin@gymflow.dev", password: "Password123" });

  assert.equal(res.status, 200);

  return bodyOf<ApiSuccess<{ accessToken: string }>>(res).data.accessToken;
}

async function loginClient() {
  const email = `admin-client-${Date.now()}@gymflow.dev`;
  const res = await request(app).post("/api/v1/auth/register").send({
    firstName: "Test",
    lastName: "Client",
    email,
    password: "Password123"
  });

  assert.equal(res.status, 201);

  const data = bodyOf<ApiSuccess<{ accessToken: string; user: { id: string } }>>(res).data;

  return { token: data.accessToken, userId: data.user.id };
}

async function cleanupUser(userId: string) {
  await prisma.user.delete({ where: { id: userId } });
}

// ─── RBAC ────────────────────────────────────────────────────────────────────

void test("cliente no puede acceder a rutas admin", async () => {
  const client = await loginClient();

  try {
    const res = await request(app)
      .get("/api/v1/admin/products")
      .set("authorization", `Bearer ${client.token}`);

    assert.equal(res.status, 403);
  } finally {
    await cleanupUser(client.userId);
  }
});

void test("token ausente en rutas admin devuelve 401", async () => {
  const res = await request(app).get("/api/v1/admin/products");
  assert.equal(res.status, 401);
});

// ─── Products CRUD ────────────────────────────────────────────────────────────

void test("admin lista todos los productos con paginacion", async () => {
  const token = await loginAdmin();

  const res = await request(app)
    .get("/api/v1/admin/products?page=1&limit=10")
    .set("authorization", `Bearer ${token}`);

  const body = bodyOf<ApiSuccess<{ items: unknown[]; total: number }>>(res);

  assert.equal(res.status, 200);
  assert.ok(Array.isArray(body.data.items));
  assert.ok(typeof body.data.total === "number");
});

void test("admin crea producto, lo actualiza y cambia estado", async () => {
  const token = await loginAdmin();
  const category = await prisma.productCategory.findFirst();
  assert.ok(category?.id);

  const createRes = await request(app)
    .post("/api/v1/admin/products")
    .set("authorization", `Bearer ${token}`)
    .send({
      name: `Test Product ${Date.now()}`,
      description: "Producto de prueba",
      price: 49.99,
      stock: 100,
      categoryId: category.id
    });

  assert.equal(createRes.status, 201);
  const productId = bodyOf<ApiSuccess<{ id: string }>>(createRes).data.id;

  try {
    const updateRes = await request(app)
      .patch(`/api/v1/admin/products/${productId}`)
      .set("authorization", `Bearer ${token}`)
      .send({ price: 39.99, stock: 50 });

    assert.equal(updateRes.status, 200);
    assert.equal(bodyOf<ApiSuccess<{ price: number }>>(updateRes).data.price, 39.99);

    const toggleRes = await request(app)
      .patch(`/api/v1/admin/products/${productId}/status`)
      .set("authorization", `Bearer ${token}`);

    assert.equal(toggleRes.status, 200);
    assert.equal(bodyOf<ApiSuccess<{ status: string }>>(toggleRes).data.status, "inactive");
  } finally {
    await prisma.product.delete({ where: { id: productId } });
  }
});

// ─── Membership plans ─────────────────────────────────────────────────────────

void test("admin lista planes con todos sus campos", async () => {
  const token = await loginAdmin();

  const res = await request(app)
    .get("/api/v1/admin/membership-plans")
    .set("authorization", `Bearer ${token}`);

  const body = bodyOf<ApiSuccess<unknown[]>>(res);

  assert.equal(res.status, 200);
  assert.ok(body.data.length > 0);
});

void test("admin crea plan de membresia y cambia estado", async () => {
  const token = await loginAdmin();

  const createRes = await request(app)
    .post("/api/v1/admin/membership-plans")
    .set("authorization", `Bearer ${token}`)
    .send({
      name: `Plan Test ${Date.now()}`,
      durationDays: 15,
      price: 69.99,
      benefits: { roomReservations: true }
    });

  assert.equal(createRes.status, 201);
  const planId = bodyOf<ApiSuccess<{ id: string }>>(createRes).data.id;

  try {
    const toggleRes = await request(app)
      .patch(`/api/v1/admin/membership-plans/${planId}/status`)
      .set("authorization", `Bearer ${token}`);

    assert.equal(toggleRes.status, 200);
    assert.equal(bodyOf<ApiSuccess<{ status: string }>>(toggleRes).data.status, "inactive");
  } finally {
    await prisma.membershipPlan.delete({ where: { id: planId } });
  }
});

// ─── Rooms ────────────────────────────────────────────────────────────────────

void test("admin crea sala y agrega horario", async () => {
  const token = await loginAdmin();

  const createRes = await request(app)
    .post("/api/v1/admin/rooms")
    .set("authorization", `Bearer ${token}`)
    .send({ name: `Sala Test ${Date.now()}`, capacity: 20 });

  assert.equal(createRes.status, 201);
  const roomId = bodyOf<ApiSuccess<{ id: string }>>(createRes).data.id;

  try {
    const scheduleStart = new Date();
    scheduleStart.setDate(scheduleStart.getDate() + 30);
    scheduleStart.setHours(8, 0, 0, 0);
    const scheduleEnd = new Date(scheduleStart.getTime() + 60 * 60 * 1000);

    const scheduleRes = await request(app)
      .post(`/api/v1/admin/rooms/${roomId}/schedules`)
      .set("authorization", `Bearer ${token}`)
      .send({
        startsAt: scheduleStart.toISOString(),
        endsAt: scheduleEnd.toISOString(),
        quota: 20
      });

    assert.equal(scheduleRes.status, 201);
  } finally {
    await prisma.roomSchedule.deleteMany({ where: { roomId } });
    await prisma.room.delete({ where: { id: roomId } });
  }
});

// ─── Promotions ──────────────────────────────────────────────────────────────

void test("admin crea, actualiza e inactiva una promocion", async () => {
  const token = await loginAdmin();
  const product = await prisma.product.findFirst({ where: { status: "active" } });
  assert.ok(product?.id);

  const createRes = await request(app)
    .post("/api/v1/admin/promotions")
    .set("authorization", `Bearer ${token}`)
    .send({
      name: `Promo Test ${Date.now()}`,
      discountPercent: 10,
      targetType: "product",
      productId: product.id,
      startsAt: new Date().toISOString(),
      endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });

  assert.equal(createRes.status, 201);
  const promoId = bodyOf<ApiSuccess<{ id: string }>>(createRes).data.id;

  try {
    const updateRes = await request(app)
      .patch(`/api/v1/admin/promotions/${promoId}`)
      .set("authorization", `Bearer ${token}`)
      .send({ discountPercent: 15 });

    assert.equal(updateRes.status, 200);
    assert.equal(bodyOf<ApiSuccess<{ discountPercent: number }>>(updateRes).data.discountPercent, 15);

    const toggleRes = await request(app)
      .patch(`/api/v1/admin/promotions/${promoId}/status`)
      .set("authorization", `Bearer ${token}`);

    assert.equal(toggleRes.status, 200);
    assert.equal(bodyOf<ApiSuccess<{ status: string }>>(toggleRes).data.status, "inactive");
  } finally {
    await prisma.promotion.delete({ where: { id: promoId } });
  }
});

void test("admin lista promociones paginadas", async () => {
  const token = await loginAdmin();

  const res = await request(app)
    .get("/api/v1/admin/promotions?page=1&limit=10")
    .set("authorization", `Bearer ${token}`);

  assert.equal(res.status, 200);
  assert.ok(typeof bodyOf<ApiSuccess<{ total: number }>>(res).data.total === "number");
});

// ─── Audit logs ──────────────────────────────────────────────────────────────

void test("admin obtiene registros de auditoria con paginacion", async () => {
  const token = await loginAdmin();

  const res = await request(app)
    .get("/api/v1/admin/audit-logs?page=1&limit=10")
    .set("authorization", `Bearer ${token}`);

  const body = bodyOf<ApiSuccess<{ items: unknown[]; total: number }>>(res);

  assert.equal(res.status, 200);
  assert.ok(Array.isArray(body.data.items));
  assert.ok(typeof body.data.total === "number");
});

// ─── Dashboard ────────────────────────────────────────────────────────────────

void test("dashboard summary devuelve todos los KPIs esperados", async () => {
  const token = await loginAdmin();

  const res = await request(app)
    .get("/api/v1/dashboard/summary")
    .set("authorization", `Bearer ${token}`);

  const body = bodyOf<ApiSuccess<{
    users: { total: number };
    memberships: { active: number };
    revenue: { total: number };
    reservations: { today: number };
    topProducts: unknown[];
  }>>(res);

  assert.equal(res.status, 200);
  assert.ok(typeof body.data.users.total === "number");
  assert.ok(typeof body.data.memberships.active === "number");
  assert.ok(typeof body.data.revenue.total === "number");
  assert.ok(typeof body.data.reservations.today === "number");
  assert.ok(Array.isArray(body.data.topProducts));
});

void test("cliente no puede acceder al dashboard", async () => {
  const client = await loginClient();

  try {
    const res = await request(app)
      .get("/api/v1/dashboard/summary")
      .set("authorization", `Bearer ${client.token}`);

    assert.equal(res.status, 403);
  } finally {
    await cleanupUser(client.userId);
  }
});
