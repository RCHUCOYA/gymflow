import { z } from "zod";
import { type Prisma, PaymentMethod } from "@prisma/client";
import { prisma } from "../../prisma/client.js";
import { AppError } from "../../utils/app-error.js";
import { httpStatus } from "../../utils/http-status.js";

// ─── Schemas ─────────────────────────────────────────────────────────────────

export const addCartItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(999)
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1).max(999)
});

export const checkoutSchema = z.object({
  paymentMethod: z.nativeEnum(PaymentMethod)
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getOrCreateActiveCart(userId: string) {
  const cart = await prisma.cart.findFirst({
    where: { userId, status: "active" }
  });

  if (cart) {
    return cart;
  }

  return prisma.cart.create({
    data: { userId, status: "active" }
  });
}

function buildReceiptCode() {
  return `RCPT-${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function listProducts(input: {
  page: number;
  limit: number;
  search?: string;
}) {
  const skip = (input.page - 1) * input.limit;

  const where: Prisma.ProductWhereInput = {
    status: "active",
    ...(input.search
      ? {
          OR: [
            { name: { contains: input.search, mode: "insensitive" } },
            { description: { contains: input.search, mode: "insensitive" } },
            { category: { name: { contains: input.search, mode: "insensitive" } } }
          ]
        }
      : {})
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: input.limit,
      orderBy: { name: "asc" },
      include: {
        category: { select: { id: true, name: true } }
      }
    }),
    prisma.product.count({ where })
  ]);

  return {
    items: items.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: Number(product.price),
      stock: product.stock,
      imageUrl: product.imageUrl,
      category: product.category
    })),
    page: input.page,
    limit: input.limit,
    total,
    totalPages: Math.ceil(total / input.limit)
  };
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export async function getCart(userId: string) {
  const cart = await prisma.cart.findFirst({
    where: { userId, status: "active" },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              stock: true,
              imageUrl: true
            }
          }
        },
        orderBy: { createdAt: "asc" }
      }
    }
  });

  if (!cart) {
    return { id: null, items: [], total: 0 };
  }

  const items = cart.items.map((item) => ({
    id: item.id,
    quantity: item.quantity,
    product: {
      id: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      price: Number(item.product.price),
      stock: item.product.stock,
      imageUrl: item.product.imageUrl
    },
    subtotal: Number(item.product.price) * item.quantity
  }));

  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  return { id: cart.id, items, total: Math.round(total * 100) / 100 };
}

export async function addCartItem(input: {
  userId: string;
  productId: string;
  quantity: number;
}) {
  const product = await prisma.product.findFirst({
    where: { id: input.productId, status: "active" }
  });

  if (!product) {
    throw new AppError(httpStatus.notFound, "NOT_FOUND", "Producto no encontrado o inactivo");
  }

  if (product.stock < input.quantity) {
    throw new AppError(
      httpStatus.unprocessableEntity,
      "BUSINESS_RULE_ERROR",
      `Stock insuficiente. Disponible: ${product.stock}`
    );
  }

  const cart = await getOrCreateActiveCart(input.userId);

  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId: input.productId } }
  });

  if (existingItem) {
    const newQuantity = existingItem.quantity + input.quantity;

    if (product.stock < newQuantity) {
      throw new AppError(
        httpStatus.unprocessableEntity,
        "BUSINESS_RULE_ERROR",
        `Stock insuficiente. Disponible: ${product.stock}`
      );
    }

    return prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQuantity },
      include: { product: { select: { id: true, name: true, price: true } } }
    });
  }

  return prisma.cartItem.create({
    data: { cartId: cart.id, productId: input.productId, quantity: input.quantity },
    include: { product: { select: { id: true, name: true, price: true } } }
  });
}

export async function updateCartItem(input: {
  userId: string;
  cartItemId: string;
  quantity: number;
}) {
  const item = await prisma.cartItem.findUnique({
    where: { id: input.cartItemId },
    include: {
      cart: { select: { userId: true, status: true } },
      product: { select: { stock: true, status: true } }
    }
  });

  if (!item || item.cart.userId !== input.userId || item.cart.status !== "active") {
    throw new AppError(httpStatus.notFound, "NOT_FOUND", "Item de carrito no encontrado");
  }

  if (item.product.stock < input.quantity) {
    throw new AppError(
      httpStatus.unprocessableEntity,
      "BUSINESS_RULE_ERROR",
      `Stock insuficiente. Disponible: ${item.product.stock}`
    );
  }

  return prisma.cartItem.update({
    where: { id: input.cartItemId },
    data: { quantity: input.quantity }
  });
}

export async function removeCartItem(input: {
  userId: string;
  cartItemId: string;
}) {
  const item = await prisma.cartItem.findUnique({
    where: { id: input.cartItemId },
    include: { cart: { select: { userId: true, status: true } } }
  });

  if (!item || item.cart.userId !== input.userId || item.cart.status !== "active") {
    throw new AppError(httpStatus.notFound, "NOT_FOUND", "Item de carrito no encontrado");
  }

  await prisma.cartItem.delete({ where: { id: input.cartItemId } });
}

// ─── Checkout ─────────────────────────────────────────────────────────────────

export async function checkout(input: {
  userId: string;
  paymentMethod: PaymentMethod;
}) {
  const cart = await prisma.cart.findFirst({
    where: { userId: input.userId, status: "active" },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, price: true, stock: true, status: true }
          }
        }
      }
    }
  });

  if (!cart || cart.items.length === 0) {
    throw new AppError(
      httpStatus.unprocessableEntity,
      "BUSINESS_RULE_ERROR",
      "El carrito esta vacio"
    );
  }

  for (const item of cart.items) {
    if (item.product.status !== "active") {
      throw new AppError(
        httpStatus.unprocessableEntity,
        "BUSINESS_RULE_ERROR",
        `El producto "${item.product.name}" ya no esta disponible`
      );
    }

    if (item.product.stock < item.quantity) {
      throw new AppError(
        httpStatus.unprocessableEntity,
        "BUSINESS_RULE_ERROR",
        `Stock insuficiente para "${item.product.name}". Disponible: ${item.product.stock}`
      );
    }
  }

  const total = cart.items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );

  const result = await prisma.$transaction(async (tx) => {
    for (const item of cart.items) {
      const updated = await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } }
      });

      if (updated.stock < 0) {
        throw new AppError(
          httpStatus.unprocessableEntity,
          "BUSINESS_RULE_ERROR",
          `Stock insuficiente para "${item.product.name}"`
        );
      }
    }

    const order = await tx.order.create({
      data: {
        userId: input.userId,
        total,
        status: "confirmed",
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.product.price
          }))
        }
      }
    });

    const payment = await tx.payment.create({
      data: {
        userId: input.userId,
        orderId: order.id,
        method: input.paymentMethod,
        amount: total,
        status: "confirmed",
        receiptCode: buildReceiptCode()
      }
    });

    await tx.cart.update({
      where: { id: cart.id },
      data: { status: "checked_out" }
    });

    return { orderId: order.id, paymentId: payment.id, receiptCode: payment.receiptCode, total };
  });

  return result;
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function listMyOrders(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, slug: true, imageUrl: true } }
        }
      },
      payment: { select: { id: true, method: true, amount: true, receiptCode: true, status: true } }
    }
  });

  return orders.map((order) => ({
    id: order.id,
    status: order.status,
    total: Number(order.total),
    items: order.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      subtotal: Number(item.unitPrice) * item.quantity,
      product: item.product
    })),
    payment: order.payment
      ? {
          id: order.payment.id,
          method: order.payment.method,
          amount: Number(order.payment.amount),
          receiptCode: order.payment.receiptCode,
          status: order.payment.status
        }
      : null,
    createdAt: order.createdAt
  }));
}

// ─── My payments ─────────────────────────────────────────────────────────────

export async function listMyPayments(userId: string) {
  const payments = await prisma.payment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      method: true,
      amount: true,
      status: true,
      receiptCode: true,
      orderId: true,
      userMembershipId: true,
      createdAt: true
    }
  });

  return payments.map((payment) => ({
    ...payment,
    amount: Number(payment.amount)
  }));
}
