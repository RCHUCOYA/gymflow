import { apiClient } from "@/lib/api-client";

type ApiSuccess<T> = {
  success: true;
  data: T;
  message: string;
};

export type UserListItem = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  status: string;
  role: {
    id: string;
    name: string;
  };
  createdAt: string;
};

type ListUsersResponse = {
  items: UserListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export async function listUsers(accessToken: string, query?: { page?: number; limit?: number; search?: string }) {
  const response = await apiClient.get<ApiSuccess<ListUsersResponse>>("/users", {
    params: query,
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  return response.data.data;
}
