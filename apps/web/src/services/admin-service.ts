import { apiClient } from "@/lib/api-client";

type ApiSuccess<T> = { success: true; data: T; message: string };

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  status: string;
  imageUrl: string | null;
  category: { id: string; name: string };
  createdAt: string;
};

export type Category = {
  id: string;
  name: string;
  _count: { products: number };
};

export type AdminMembershipPlan = {
  id: string;
  name: string;
  durationDays: number;
  price: number;
  benefits: Record<string, unknown>;
  status: string;
  createdAt: string;
};

export type AdminRoom = {
  id: string;
  name: string;
  capacity: number;
  status: string;
  schedulesCount: number;
  createdAt: string;
};

export type Promotion = {
  id: string;
  name: string;
  description: string | null;
  discountPercent: number;
  targetType: string;
  status: string;
  startsAt: string;
  endsAt: string;
  product: { id: string; name: string } | null;
  membershipPlan: { id: string; name: string } | null;
  createdAt: string;
};

export type AuditLog = {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  metadata: unknown;
  actor: { id: string; firstName: string; lastName: string; email: string };
  createdAt: string;
};

export type DashboardSummary = {
  period: { from: string; to: string };
  users: { total: number; newClientsThisMonth: number };
  memberships: { active: number; expired: number };
  revenue: { total: number; orders: number; memberships: number };
  reservations: { today: number; total: number; cancelled: number };
  topProducts: Array<{ productId: string; name: string; quantitySold: number }>;
  roomUsage: Array<{ roomScheduleId: string; roomName: string; reservations: number }>;
  topTrainers: Array<{ professionalProfileId: string; name: string; appointments: number }>;
  topNutritionists: Array<{ professionalProfileId: string; name: string; appointments: number }>;
};

type Paginated<T> = { items: T[]; page: number; limit: number; total: number; totalPages: number };

function headers(token: string) {
  return { Authorization: `Bearer ${token}` };
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export async function getDashboardSummary(accessToken: string) {
  const res = await apiClient.get<ApiSuccess<DashboardSummary>>("/dashboard/summary", {
    headers: headers(accessToken)
  });

  return res.data.data;
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function adminListProducts(
  accessToken: string,
  params?: { page?: number; limit?: number; search?: string }
) {
  const res = await apiClient.get<ApiSuccess<Paginated<AdminProduct>>>("/admin/products", {
    headers: headers(accessToken),
    params
  });

  return res.data.data;
}

export async function adminCreateProduct(
  accessToken: string,
  data: {
    name: string;
    description?: string;
    price: number;
    stock: number;
    categoryId: string;
    imageUrl?: string;
  }
) {
  const res = await apiClient.post<ApiSuccess<AdminProduct>>("/admin/products", data, {
    headers: headers(accessToken)
  });

  return res.data.data;
}

export async function adminUpdateProduct(
  accessToken: string,
  productId: string,
  data: Partial<{ name: string; price: number; stock: number; description: string }>
) {
  const res = await apiClient.patch<ApiSuccess<AdminProduct>>(`/admin/products/${productId}`, data, {
    headers: headers(accessToken)
  });

  return res.data.data;
}

export async function adminToggleProductStatus(accessToken: string, productId: string) {
  const res = await apiClient.patch<ApiSuccess<{ id: string; status: string }>>(
    `/admin/products/${productId}/status`,
    null,
    { headers: headers(accessToken) }
  );

  return res.data.data;
}

export async function adminListCategories(accessToken: string) {
  const res = await apiClient.get<ApiSuccess<Category[]>>("/admin/categories", {
    headers: headers(accessToken)
  });

  return res.data.data;
}

// ─── Membership plans ─────────────────────────────────────────────────────────

export async function adminListPlans(accessToken: string) {
  const res = await apiClient.get<ApiSuccess<AdminMembershipPlan[]>>("/admin/membership-plans", {
    headers: headers(accessToken)
  });

  return res.data.data;
}

export async function adminTogglePlanStatus(accessToken: string, planId: string) {
  const res = await apiClient.patch<ApiSuccess<{ id: string; status: string }>>(
    `/admin/membership-plans/${planId}/status`,
    null,
    { headers: headers(accessToken) }
  );

  return res.data.data;
}

// ─── Rooms ────────────────────────────────────────────────────────────────────

export async function adminListRooms(accessToken: string) {
  const res = await apiClient.get<ApiSuccess<AdminRoom[]>>("/admin/rooms", {
    headers: headers(accessToken)
  });

  return res.data.data;
}

export async function adminToggleRoomStatus(accessToken: string, roomId: string) {
  const res = await apiClient.patch<ApiSuccess<{ id: string; status: string }>>(
    `/admin/rooms/${roomId}/status`,
    null,
    { headers: headers(accessToken) }
  );

  return res.data.data;
}

// ─── Promotions ──────────────────────────────────────────────────────────────

export async function adminListPromotions(
  accessToken: string,
  params?: { page?: number; limit?: number }
) {
  const res = await apiClient.get<ApiSuccess<Paginated<Promotion>>>("/admin/promotions", {
    headers: headers(accessToken),
    params
  });

  return res.data.data;
}

export async function adminCreatePromotion(
  accessToken: string,
  data: {
    name: string;
    description?: string;
    discountPercent: number;
    targetType: "product" | "membership_plan";
    productId?: string;
    membershipPlanId?: string;
    startsAt: string;
    endsAt: string;
  }
) {
  const res = await apiClient.post<ApiSuccess<Promotion>>("/admin/promotions", data, {
    headers: headers(accessToken)
  });

  return res.data.data;
}

export async function adminTogglePromotionStatus(accessToken: string, promotionId: string) {
  const res = await apiClient.patch<ApiSuccess<{ id: string; status: string }>>(
    `/admin/promotions/${promotionId}/status`,
    null,
    { headers: headers(accessToken) }
  );

  return res.data.data;
}

// ─── Audit logs ──────────────────────────────────────────────────────────────

export async function adminListAuditLogs(
  accessToken: string,
  params?: { page?: number; limit?: number; entity?: string }
) {
  const res = await apiClient.get<ApiSuccess<Paginated<AuditLog>>>("/admin/audit-logs", {
    headers: headers(accessToken),
    params
  });

  return res.data.data;
}
