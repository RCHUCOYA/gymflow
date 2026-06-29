import { apiClient } from "@/lib/api-client";

export type MembershipPlan = {
  id: string;
  name: string;
  durationDays: number;
  price: number;
  benefits: Record<string, unknown>;
};

export type CurrentMembership = {
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
};

type ApiSuccess<T> = {
  success: true;
  data: T;
  message: string;
};

export async function listMembershipPlans() {
  const response = await apiClient.get<ApiSuccess<MembershipPlan[]>>("/membership-plans");
  return response.data.data;
}

export async function purchaseMembership(input: {
  accessToken: string;
  membershipPlanId: string;
  paymentMethod: "Visa" | "Mastercard" | "Yape" | "Plin" | "Transferencia";
}) {
  const response = await apiClient.post<ApiSuccess<{ receiptCode: string }>>(
    "/memberships/purchase",
    {
      membershipPlanId: input.membershipPlanId,
      paymentMethod: input.paymentMethod
    },
    {
      headers: {
        Authorization: `Bearer ${input.accessToken}`
      }
    }
  );

  return response.data.data;
}

export async function renewMembership(input: {
  accessToken: string;
  membershipPlanId: string;
  paymentMethod: "Visa" | "Mastercard" | "Yape" | "Plin" | "Transferencia";
}) {
  const response = await apiClient.post<ApiSuccess<{ receiptCode: string }>>(
    "/memberships/renew",
    {
      membershipPlanId: input.membershipPlanId,
      paymentMethod: input.paymentMethod
    },
    {
      headers: {
        Authorization: `Bearer ${input.accessToken}`
      }
    }
  );

  return response.data.data;
}

export async function getMyMembership(accessToken: string) {
  const response = await apiClient.get<ApiSuccess<CurrentMembership | null>>("/memberships/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  return response.data.data;
}
