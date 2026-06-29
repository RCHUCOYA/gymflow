import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { prisma } from "../../prisma/client.js";
import { createApp } from "../../app.js";

const app = createApp();

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

type AuthResponseBody = {
  success: boolean;
  data: AuthTokens;
};

type ErrorResponseBody = {
  success: boolean;
  error: {
    code: string;
    message: string;
  };
};

function bodyOf<T>(response: request.Response) {
  return response.body as T;
}

void test("login correcto e incorrecto", async () => {
  const okResponse = await request(app).post("/api/v1/auth/login").send({
    email: "cliente@gymflow.dev",
    password: "Password123"
  });
  const okBody = bodyOf<AuthResponseBody>(okResponse);

  assert.equal(okResponse.status, 200);
  assert.equal(okBody.success, true);
  assert.equal(typeof okBody.data.accessToken, "string");
  assert.equal(typeof okBody.data.refreshToken, "string");

  const badResponse = await request(app).post("/api/v1/auth/login").send({
    email: "cliente@gymflow.dev",
    password: "invalid-password"
  });
  const badBody = bodyOf<ErrorResponseBody>(badResponse);

  assert.equal(badResponse.status, 401);
  assert.equal(badBody.success, false);
});

void test("todos los roles demo pueden iniciar sesion", async () => {
  const emails = [
    "admin@gymflow.dev",
    "recepcion@gymflow.dev",
    "cliente@gymflow.dev",
    "trainer@gymflow.dev",
    "nutri@gymflow.dev"
  ];

  for (const email of emails) {
    const response = await request(app).post("/api/v1/auth/login").send({
      email,
      password: "Password123"
    });
    const body = bodyOf<AuthResponseBody>(response);

    assert.equal(response.status, 200);
    assert.equal(body.success, true);
  }
});

void test("token ausente bloquea perfil", async () => {
  const response = await request(app).get("/api/v1/users/me");
  const body = bodyOf<ErrorResponseBody>(response);

  assert.equal(response.status, 401);
  assert.equal(body.success, false);
});

void test("token invalido bloquea perfil", async () => {
  const response = await request(app)
    .get("/api/v1/users/me")
    .set("authorization", "Bearer invalid-token");
  const body = bodyOf<ErrorResponseBody>(response);

  assert.equal(response.status, 401);
  assert.equal(body.success, false);
});

void test("cliente no puede acceder a endpoint admin", async () => {
  const loginResponse = await request(app).post("/api/v1/auth/login").send({
    email: "cliente@gymflow.dev",
    password: "Password123"
  });
  const loginBody = bodyOf<AuthResponseBody>(loginResponse);

  const token = loginBody.data.accessToken;

  const response = await request(app)
    .get("/api/v1/users")
    .set("authorization", `Bearer ${token}`);
  const body = bodyOf<ErrorResponseBody>(response);

  assert.equal(response.status, 403);
  assert.equal(body.success, false);
});

void test("cambio de rol solo por administrador", async () => {
  const [adminLogin, clientLogin, clienteRole, trainerRole, targetUser] = await Promise.all([
    request(app).post("/api/v1/auth/login").send({
      email: "admin@gymflow.dev",
      password: "Password123"
    }),
    request(app).post("/api/v1/auth/login").send({
      email: "cliente@gymflow.dev",
      password: "Password123"
    }),
    prisma.role.findUnique({ where: { name: "Cliente" } }),
    prisma.role.findUnique({ where: { name: "Entrenador" } }),
    prisma.user.findUnique({ where: { email: "trainer@gymflow.dev" } })
  ]);

  assert.ok(clienteRole?.id);
  assert.ok(trainerRole?.id);
  assert.ok(targetUser?.id);

  const clientToken = bodyOf<AuthResponseBody>(clientLogin).data.accessToken;
  const adminToken = bodyOf<AuthResponseBody>(adminLogin).data.accessToken;

  const forbidden = await request(app)
    .patch(`/api/v1/users/${targetUser?.id}/role`)
    .set("authorization", `Bearer ${clientToken}`)
    .send({ roleId: clienteRole?.id });

  assert.equal(forbidden.status, 403);

  const allowed = await request(app)
    .patch(`/api/v1/users/${targetUser?.id}/role`)
    .set("authorization", `Bearer ${adminToken}`)
    .send({ roleId: clienteRole?.id });
  const allowedBody = bodyOf<{ success: boolean }>(allowed);

  assert.equal(allowed.status, 200);
  assert.equal(allowedBody.success, true);

  // Restore trainer role so subsequent test files are not affected
  await prisma.user.update({
    where: { id: targetUser.id },
    data: { roleId: trainerRole.id }
  });
});

void test("refresh token revocado no renueva sesion", async () => {
  const loginResponse = await request(app).post("/api/v1/auth/login").send({
    email: "cliente@gymflow.dev",
    password: "Password123"
  });
  const loginBody = bodyOf<AuthResponseBody>(loginResponse);

  const accessToken = loginBody.data.accessToken;
  const refreshToken = loginBody.data.refreshToken;

  const logoutResponse = await request(app)
    .post("/api/v1/auth/logout")
    .set("authorization", `Bearer ${accessToken}`)
    .send({ refreshToken });

  assert.equal(logoutResponse.status, 204);

  const refreshResponse = await request(app).post("/api/v1/auth/refresh").send({ refreshToken });
  const refreshBody = bodyOf<ErrorResponseBody>(refreshResponse);

  assert.equal(refreshResponse.status, 401);
  assert.equal(refreshBody.success, false);
});
