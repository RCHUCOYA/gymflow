import { apiClient } from "@/lib/api-client";

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  category: { id: string; name: string };
};

export type CartItem = {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    stock: number;
    imageUrl: string | null;
  };
  subtotal: number;
};

export type Cart = {
  id: string | null;
  items: CartItem[];
  total: number;
};

export type Order = {
  id: string;
  status: string;
  total: number;
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    product: { id: string; name: string; slug: string; imageUrl: string | null };
  }>;
  payment: {
    id: string;
    method: string;
    amount: number;
    receiptCode: string;
    status: string;
  } | null;
  createdAt: string;
};

export type Payment = {
  id: string;
  method: string;
  amount: number;
  status: string;
  receiptCode: string;
  orderId: string | null;
  userMembershipId: string | null;
  createdAt: string;
};

type ApiSuccess<T> = { success: true; data: T; message: string };

type PaginatedProducts = {
  items: Product[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export async function listProducts(params?: { page?: number; limit?: number; search?: string }) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.search) query.set("search", params.search);

  const response = await apiClient.get<ApiSuccess<PaginatedProducts>>(`/products?${query.toString()}`);
  return response.data.data;
}

export async function getCart(accessToken: string) {
  const response = await apiClient.get<ApiSuccess<Cart>>("/cart", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  return response.data.data;
}

export async function addToCart(input: {
  accessToken: string;
  productId: string;
  quantity: number;
}) {
  const response = await apiClient.post<ApiSuccess<CartItem>>(
    "/cart/items",
    { productId: input.productId, quantity: input.quantity },
    { headers: { Authorization: `Bearer ${input.accessToken}` } }
  );

  return response.data.data;
}

export async function updateCartItemQuantity(input: {
  accessToken: string;
  cartItemId: string;
  quantity: number;
}) {
  const response = await apiClient.patch<ApiSuccess<CartItem>>(
    `/cart/items/${input.cartItemId}`,
    { quantity: input.quantity },
    { headers: { Authorization: `Bearer ${input.accessToken}` } }
  );

  return response.data.data;
}

export async function removeFromCart(input: { accessToken: string; cartItemId: string }) {
  await apiClient.delete(`/cart/items/${input.cartItemId}`, {
    headers: { Authorization: `Bearer ${input.accessToken}` }
  });
}

export async function checkout(input: { accessToken: string; paymentMethod: string }) {
  const response = await apiClient.post<ApiSuccess<{ orderId: string; receiptCode: string; total: number }>>(
    "/orders/checkout",
    { paymentMethod: input.paymentMethod },
    { headers: { Authorization: `Bearer ${input.accessToken}` } }
  );

  return response.data.data;
}

export async function listMyOrders(accessToken: string) {
  const response = await apiClient.get<ApiSuccess<Order[]>>("/orders/me", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  return response.data.data;
}

export async function listMyPayments(accessToken: string) {
  const response = await apiClient.get<ApiSuccess<Payment[]>>("/payments/me", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  return response.data.data;
}
