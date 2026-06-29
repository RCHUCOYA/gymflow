import assert from "node:assert/strict";
import test from "node:test";
import { PaymentMethod } from "@prisma/client";
import request from "supertest";
import { createApp } from "../../app.js";
import { prisma } from "../../prisma/client.js";

const app = createApp();

type AuthResponseBody = {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      role: string;
    };
  };
};

type MembershipPlan = {
  id: string;
  name: string;
  durationDays: number;
  price: number;
  benefits: Record<string, unknown>;
};

type PaymentSummary = {
  membershipId: string;
  paymentId: string;
  receiptCode: string;
  membershipPlan: {
    id: string;
    name: string;
    benefits: Record<string, unknown>;
  };
  startsAt: string;
  endsAt: string;
};

type CurrentMembershipResponse = {
  success: boolean;
  data: {
    id: string;
    startsAt: string;
    endsAt: string;
    status: string;
    membershipPlan: {
      id: string;
      name: string;
      durationDays: number;
      price: number;
      benefits: Record<string, unknown>;
    };
  } | null;
};

type ApiSuccess<T> = {
  success: boolean;
  data: T;
};

function bodyOf<T>(response: request.Response) {
  return response.body as T;
}

async function registerClient() {
  const email = `memberships-${Date.now()}-${Math.random().toString(36).slice(2)}@gymflow.dev`;
  const response = await request(app).post("/api/v1/auth/register").send({
    firstName: "Membership",
    lastName: "Tester",
    email,
    password: "Password123",
    phone: "+51999999999"
  });

  assert.equal(response.status, 201);

  return bodyOf<AuthResponseBody>(response).data;
}

async function cleanupUserData(userId: string) {
  await prisma.payment.deleteMany({ where: { userId } });
  await prisma.userMembership.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { id: userId } });
}

function dateOnly(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return dateOnly(result);
}

void test("listado publico de planes devuelve planes activos ordenados por precio", async () => {
  const response = await request(app).get("/api/v1/membership-plans");
  const body = bodyOf<ApiSuccess<MembershipPlan[]>>(response);

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.ok(body.data.length > 0);

  const prices = body.data.map((plan) => plan.price);
  const sorted = [...prices].sort((left, right) => left - right);

  assert.deepEqual(prices, sorted);
  assert.ok(body.data.every((plan) => typeof plan.benefits === "object"));
});

void test("compra de membresia registra pago por cada metodo permitido", async () => {
  const plan = await prisma.membershipPlan.findUnique({ where: { name: "Mensual" } });

  assert.ok(plan?.id);

  for (const paymentMethod of Object.values(PaymentMethod)) {
    const client = await registerClient();

    try {
      const response = await request(app)
        .post("/api/v1/memberships/purchase")
        .set("authorization", `Bearer ${client.accessToken}`)
        .send({
          membershipPlanId: plan.id,
          paymentMethod
        });
      const body = bodyOf<ApiSuccess<PaymentSummary>>(response);

      assert.equal(response.status, 201);
      assert.equal(body.success, true);
      assert.equal(typeof body.data.membershipId, "string");
      assert.equal(typeof body.data.paymentId, "string");
      assert.match(body.data.receiptCode, /^RCPT-/);
      assert.equal(body.data.membershipPlan.id, plan.id);

      const payment = await prisma.payment.findUnique({ where: { receiptCode: body.data.receiptCode } });
      const membership = await prisma.userMembership.findUnique({ where: { id: body.data.membershipId } });

      assert.equal(payment?.id, body.data.paymentId);
      assert.equal(payment?.method, paymentMethod);
      assert.equal(payment?.status, "confirmed");
      assert.equal(payment?.userId, client.user.id);
      assert.equal(payment?.userMembershipId, membership?.id);
      assert.equal(membership?.status, "active");
    } finally {
      await cleanupUserData(client.user.id);
    }
  }
});

void test("renovacion activa y vencida calcula la nueva vigencia correctamente", async () => {
  const [monthlyPlan, weeklyPlan] = await Promise.all([
    prisma.membershipPlan.findUnique({ where: { name: "Mensual" } }),
    prisma.membershipPlan.findUnique({ where: { name: "Semanal" } })
  ]);

  assert.ok(monthlyPlan?.id);
  assert.ok(weeklyPlan?.id);

  const activeClient = await registerClient();
  const expiredClient = await registerClient();

  try {
    const purchaseResponse = await request(app)
      .post("/api/v1/memberships/purchase")
      .set("authorization", `Bearer ${activeClient.accessToken}`)
      .send({
        membershipPlanId: monthlyPlan.id,
        paymentMethod: PaymentMethod.Visa
      });

    assert.equal(purchaseResponse.status, 201);

    const currentMembership = await prisma.userMembership.findFirst({
      where: { userId: activeClient.user.id },
      orderBy: { endsAt: "desc" }
    });

    assert.ok(currentMembership);

    const renewActiveResponse = await request(app)
      .post("/api/v1/memberships/renew")
      .set("authorization", `Bearer ${activeClient.accessToken}`)
      .send({
        membershipPlanId: weeklyPlan.id,
        paymentMethod: PaymentMethod.Plin
      });
    const renewActiveBody = bodyOf<ApiSuccess<PaymentSummary>>(renewActiveResponse);

    assert.equal(renewActiveResponse.status, 201);
    assert.equal(
      renewActiveBody.data.startsAt,
      addDays(dateOnly(currentMembership.endsAt), 1).toISOString()
    );

    const expiredBaseDate = dateOnly(new Date());
    const expiredMembership = await prisma.userMembership.create({
      data: {
        userId: expiredClient.user.id,
        membershipPlanId: monthlyPlan.id,
        startsAt: addDays(expiredBaseDate, -10),
        endsAt: addDays(expiredBaseDate, -1),
        status: "active"
      }
    });

    const renewExpiredResponse = await request(app)
      .post("/api/v1/memberships/renew")
      .set("authorization", `Bearer ${expiredClient.accessToken}`)
      .send({
        membershipPlanId: weeklyPlan.id,
        paymentMethod: PaymentMethod.Yape
      });
    const renewExpiredBody = bodyOf<ApiSuccess<PaymentSummary>>(renewExpiredResponse);

    assert.equal(renewExpiredResponse.status, 201);
    assert.equal(renewExpiredBody.data.startsAt, expiredBaseDate.toISOString());

    const renewedPayment = await prisma.payment.findUnique({
      where: { receiptCode: renewExpiredBody.data.receiptCode }
    });

    assert.equal(renewedPayment?.userMembershipId === expiredMembership.id, false);
  } finally {
    await cleanupUserData(activeClient.user.id);
    await cleanupUserData(expiredClient.user.id);
  }
});

void test("consulta de membresia actual devuelve null sin membresia y expira membresias vencidas", async () => {
  const plan = await prisma.membershipPlan.findUnique({ where: { name: "Mensual" } });

  assert.ok(plan?.id);

  const client = await registerClient();

  try {
    const emptyResponse = await request(app)
      .get("/api/v1/memberships/me")
      .set("authorization", `Bearer ${client.accessToken}`);
    const emptyBody = bodyOf<CurrentMembershipResponse>(emptyResponse);

    assert.equal(emptyResponse.status, 200);
    assert.equal(emptyBody.data, null);

    const now = dateOnly(new Date());
    const expiredMembership = await prisma.userMembership.create({
      data: {
        userId: client.user.id,
        membershipPlanId: plan.id,
        startsAt: addDays(now, -35),
        endsAt: addDays(now, -1),
        status: "active"
      }
    });

    const response = await request(app)
      .get("/api/v1/memberships/me")
      .set("authorization", `Bearer ${client.accessToken}`);
    const body = bodyOf<CurrentMembershipResponse>(response);

    assert.equal(response.status, 200);
    assert.equal(body.data?.id, expiredMembership.id);
    assert.equal(body.data?.status, "expired");

    const storedMembership = await prisma.userMembership.findUnique({
      where: { id: expiredMembership.id }
    });

    assert.equal(storedMembership?.status, "expired");
  } finally {
    await cleanupUserData(client.user.id);
  }
});