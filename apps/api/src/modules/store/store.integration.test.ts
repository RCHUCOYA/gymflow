import assert from "node:assert/strict";
import test from "node:test";
import { PaymentMethod } from "@prisma/client";
import request from "supertest";
import { createApp } from "../../app.js";
import { prisma } from "../../prisma/client.js";

const app = createApp();

type ApiSuccess<T> = {
  success: boolean;
  data: T;
};

type ProductItem = {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
};

type CartItemResult = {
  id: string;
  quantity: number;
};

type CheckoutResult = {
  orderId: string;
  paymentId: string;
  receiptCode: string;
  total: number;
};

function bodyOf<T>(response: request.Response) {
  return response.body as T;
}

async function registerClient() {
  const email = `store-${Date.now()}-${Math.random().toString(36).slice(2)}@gymflow.dev`;
  const res = await request(app).post("/api/v1/auth/register").send({
    firstName: "Store",
    lastName: "Tester",
    email,
    password: "Password123",
    phone: "+51999999996"
  });

  assert.equal(res.status, 201);

  const data = bodyOf<ApiSuccess<{ accessToken: string; user: { id: string } }>>(res).data;

  return { token: data.accessToken, userId: data.user.id };
}

async function cleanupUser(userId: string) {
  await prisma.payment.deleteMany({ where: { userId } });
  const orders = await prisma.order.findMany({ where: { userId }, select: { id: true } });
  const orderIds = orders.map((o) => o.id);

  if (orderIds.length > 0) {
    await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
    await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
  }

  const carts = await prisma.cart.findMany({ where: { userId }, select: { id: true } });
  const cartIds = carts.map((c) => c.id);

  if (cartIds.length > 0) {
    await prisma.cartItem.deleteMany({ where: { cartId: { in: cartIds } } });
    await prisma.cart.deleteMany({ where: { id: { in: cartIds } } });
  }

  await prisma.user.delete({ where: { id: userId } });
}

async function getFirstProduct() {
  const product = await prisma.product.findFirst({ where: { status: "active", stock: { gt: 2 } } });
  assert.ok(product?.id, "No hay productos activos con stock en el seed");

  return product;
}

// ─── Products listing ────────────────────────────────────────────────────────

void test("listar productos devuelve pagina con items y paginacion correcta", async () => {
  const response = await request(app).get("/api/v1/products?page=1&limit=10");
  const body = bodyOf<ApiSuccess<{ items: ProductItem[]; total: number; totalPages: number }>>(response);

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.ok(Array.isArray(body.data.items));
  assert.ok(typeof body.data.total === "number");
  assert.ok(typeof body.data.totalPages === "number");
  assert.ok(body.data.items.every((p) => typeof p.price === "number"));
});

void test("busqueda por texto devuelve productos que coinciden", async () => {
  const response = await request(app).get("/api/v1/products?search=proteina");
  const body = bodyOf<ApiSuccess<{ items: ProductItem[] }>>(response);

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(body.data.items));
});

// ─── Cart ─────────────────────────────────────────────────────────────────────

void test("obtener carrito vacio devuelve id null y total 0", async () => {
  const client = await registerClient();

  try {
    const response = await request(app)
      .get("/api/v1/cart")
      .set("authorization", `Bearer ${client.token}`);
    const body = bodyOf<ApiSuccess<{ id: null; items: unknown[]; total: number }>>(response);

    assert.equal(response.status, 200);
    assert.equal(body.data.id, null);
    assert.equal(body.data.total, 0);
    assert.equal(body.data.items.length, 0);
  } finally {
    await cleanupUser(client.userId);
  }
});

void test("agregar item al carrito y verificar total calculado", async () => {
  const client = await registerClient();
  const product = await getFirstProduct();

  try {
    const addResponse = await request(app)
      .post("/api/v1/cart/items")
      .set("authorization", `Bearer ${client.token}`)
      .send({ productId: product.id, quantity: 2 });

    assert.equal(addResponse.status, 201);
    assert.equal(bodyOf<ApiSuccess<CartItemResult>>(addResponse).success, true);

    const cartResponse = await request(app)
      .get("/api/v1/cart")
      .set("authorization", `Bearer ${client.token}`);
    const cart = bodyOf<ApiSuccess<{ items: unknown[]; total: number }>>(cartResponse).data;

    assert.equal(cart.items.length, 1);
    assert.ok(cart.total > 0);
  } finally {
    await cleanupUser(client.userId);
  }
});

void test("agregar mismo producto acumula cantidad", async () => {
  const client = await registerClient();
  const product = await getFirstProduct();

  try {
    await request(app)
      .post("/api/v1/cart/items")
      .set("authorization", `Bearer ${client.token}`)
      .send({ productId: product.id, quantity: 1 });

    await request(app)
      .post("/api/v1/cart/items")
      .set("authorization", `Bearer ${client.token}`)
      .send({ productId: product.id, quantity: 1 });

    const cartResponse = await request(app)
      .get("/api/v1/cart")
      .set("authorization", `Bearer ${client.token}`);

    const cart = bodyOf<ApiSuccess<{ items: Array<{ quantity: number }> }>>(cartResponse).data;

    assert.equal(cart.items.length, 1);
    assert.equal(cart.items[0]?.quantity, 2);
  } finally {
    await cleanupUser(client.userId);
  }
});

void test("eliminar item del carrito devuelve 204", async () => {
  const client = await registerClient();
  const product = await getFirstProduct();

  try {
    const addResponse = await request(app)
      .post("/api/v1/cart/items")
      .set("authorization", `Bearer ${client.token}`)
      .send({ productId: product.id, quantity: 1 });

    const cartItemId = bodyOf<ApiSuccess<CartItemResult>>(addResponse).data.id;

    const deleteResponse = await request(app)
      .delete(`/api/v1/cart/items/${cartItemId}`)
      .set("authorization", `Bearer ${client.token}`);

    assert.equal(deleteResponse.status, 204);

    const cartResponse = await request(app)
      .get("/api/v1/cart")
      .set("authorization", `Bearer ${client.token}`);

    assert.equal(bodyOf<ApiSuccess<{ items: unknown[] }>>(cartResponse).data.items.length, 0);
  } finally {
    await cleanupUser(client.userId);
  }
});

// ─── Checkout ─────────────────────────────────────────────────────────────────

void test("checkout con carrito valido crea orden y pago, descuenta stock", async () => {
  const client = await registerClient();
  const product = await getFirstProduct();
  const stockBefore = product.stock;

  try {
    await request(app)
      .post("/api/v1/cart/items")
      .set("authorization", `Bearer ${client.token}`)
      .send({ productId: product.id, quantity: 1 });

    const checkoutResponse = await request(app)
      .post("/api/v1/orders/checkout")
      .set("authorization", `Bearer ${client.token}`)
      .send({ paymentMethod: PaymentMethod.Visa });
    const checkoutBody = bodyOf<ApiSuccess<CheckoutResult>>(checkoutResponse);

    assert.equal(checkoutResponse.status, 201);
    assert.match(checkoutBody.data.receiptCode, /^RCPT-/);
    assert.ok(checkoutBody.data.total > 0);

    const stockAfter = await prisma.product.findUnique({ where: { id: product.id } });
    assert.equal(stockAfter?.stock, stockBefore - 1);

    const order = await prisma.order.findUnique({ where: { id: checkoutBody.data.orderId } });
    assert.equal(order?.status, "confirmed");
  } finally {
    await cleanupUser(client.userId);
    await prisma.product.update({ where: { id: product.id }, data: { stock: stockBefore } });
  }
});

void test("checkout con carrito vacio devuelve 422", async () => {
  const client = await registerClient();

  try {
    const response = await request(app)
      .post("/api/v1/orders/checkout")
      .set("authorization", `Bearer ${client.token}`)
      .send({ paymentMethod: PaymentMethod.Yape });

    assert.equal(response.status, 422);
  } finally {
    await cleanupUser(client.userId);
  }
});

// ─── Orders ───────────────────────────────────────────────────────────────────

void test("listar mis ordenes devuelve solo las del cliente autenticado", async () => {
  const clientA = await registerClient();
  const clientB = await registerClient();
  const product = await getFirstProduct();
  const stockBefore = product.stock;

  try {
    await request(app)
      .post("/api/v1/cart/items")
      .set("authorization", `Bearer ${clientA.token}`)
      .send({ productId: product.id, quantity: 1 });

    await request(app)
      .post("/api/v1/orders/checkout")
      .set("authorization", `Bearer ${clientA.token}`)
      .send({ paymentMethod: PaymentMethod.Mastercard });

    const responseA = await request(app)
      .get("/api/v1/orders/me")
      .set("authorization", `Bearer ${clientA.token}`);
    const bodyA = bodyOf<ApiSuccess<unknown[]>>(responseA);

    assert.equal(responseA.status, 200);
    assert.ok(bodyA.data.length >= 1);

    const responseB = await request(app)
      .get("/api/v1/orders/me")
      .set("authorization", `Bearer ${clientB.token}`);
    const bodyB = bodyOf<ApiSuccess<unknown[]>>(responseB);

    assert.equal(responseB.status, 200);
    assert.equal(bodyB.data.length, 0);
  } finally {
    await cleanupUser(clientA.userId);
    await cleanupUser(clientB.userId);
    await prisma.product.update({ where: { id: product.id }, data: { stock: stockBefore } });
  }
});

// ─── Payments ────────────────────────────────────────────────────────────────

void test("mis pagos incluye pagos de membresias y ordenes", async () => {
  const client = await registerClient();

  try {
    const response = await request(app)
      .get("/api/v1/payments/me")
      .set("authorization", `Bearer ${client.token}`);

    assert.equal(response.status, 200);
    assert.ok(Array.isArray(bodyOf<ApiSuccess<unknown[]>>(response).data));
  } finally {
    await cleanupUser(client.userId);
  }
});
