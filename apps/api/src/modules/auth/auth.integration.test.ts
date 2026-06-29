import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { prisma } from "../../prisma/client.js";
import { createApp } from "../../app.js";

const app = createApp();

test("login correcto e incorrecto", async () => {
  const okResponse = await request(app).post("/api/v1/auth/login").send({
    email: "cliente@gymflow.dev",
    password: "Password123"
  });

  assert.equal(okResponse.status, 200);
  assert.equal(okResponse.body.success, true);
  assert.equal(typeof okResponse.body.data.accessToken, "string");
  assert.equal(typeof okResponse.body.data.refreshToken, "string");

  const badResponse = await request(app).post("/api/v1/auth/login").send({
    email: "cliente@gymflow.dev",
    password: "invalid-password"
  });

  assert.equal(badResponse.status, 401);
  assert.equal(badResponse.body.success, false);
});

test("todos los roles demo pueden iniciar sesion", async () => {
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

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
  }
});

test("token ausente bloquea perfil", async () => {
  const response = await request(app).get("/api/v1/users/me");

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("token invalido bloquea perfil", async () => {
  const response = await request(app)
    .get("/api/v1/users/me")
    .set("authorization", "Bearer invalid-token");

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("cliente no puede acceder a endpoint admin", async () => {
  const loginResponse = await request(app).post("/api/v1/auth/login").send({
    email: "cliente@gymflow.dev",
    password: "Password123"
  });

  const token = loginResponse.body.data.accessToken as string;

  const response = await request(app)
    .get("/api/v1/users")
    .set("authorization", `Bearer ${token}`);

  assert.equal(response.status, 403);
  assert.equal(response.body.success, false);
});

test("cambio de rol solo por administrador", async () => {
  const [adminLogin, clientLogin, clienteRole, targetUser] = await Promise.all([
    request(app).post("/api/v1/auth/login").send({
      email: "admin@gymflow.dev",
      password: "Password123"
    }),
    request(app).post("/api/v1/auth/login").send({
      email: "cliente@gymflow.dev",
      password: "Password123"
    }),
    prisma.role.findUnique({ where: { name: "Cliente" } }),
    prisma.user.findUnique({ where: { email: "trainer@gymflow.dev" } })
  ]);

  assert.ok(clienteRole?.id);
  assert.ok(targetUser?.id);

  const clientToken = clientLogin.body.data.accessToken as string;
  const adminToken = adminLogin.body.data.accessToken as string;

  const forbidden = await request(app)
    .patch(`/api/v1/users/${targetUser?.id}/role`)
    .set("authorization", `Bearer ${clientToken}`)
    .send({ roleId: clienteRole?.id });

  assert.equal(forbidden.status, 403);

  const allowed = await request(app)
    .patch(`/api/v1/users/${targetUser?.id}/role`)
    .set("authorization", `Bearer ${adminToken}`)
    .send({ roleId: clienteRole?.id });

  assert.equal(allowed.status, 200);
  assert.equal(allowed.body.success, true);
});

test("refresh token revocado no renueva sesion", async () => {
  const loginResponse = await request(app).post("/api/v1/auth/login").send({
    email: "cliente@gymflow.dev",
    password: "Password123"
  });

  const accessToken = loginResponse.body.data.accessToken as string;
  const refreshToken = loginResponse.body.data.refreshToken as string;

  const logoutResponse = await request(app)
    .post("/api/v1/auth/logout")
    .set("authorization", `Bearer ${accessToken}`)
    .send({ refreshToken });

  assert.equal(logoutResponse.status, 204);

  const refreshResponse = await request(app).post("/api/v1/auth/refresh").send({ refreshToken });

  assert.equal(refreshResponse.status, 401);
  assert.equal(refreshResponse.body.success, false);
});
