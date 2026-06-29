import { apiClient } from "@/lib/api-client";
import type { AuthSession, LoginInput, RegisterInput } from "@/types/auth";

type ApiSuccess<T> = {
  success: true;
  data: T;
  message: string;
};

export async function login(input: LoginInput): Promise<AuthSession> {
  const response = await apiClient.post<ApiSuccess<AuthSession>>("/auth/login", input);
  return response.data.data;
}

export async function register(input: RegisterInput): Promise<AuthSession> {
  const response = await apiClient.post<ApiSuccess<AuthSession>>("/auth/register", input);
  return response.data.data;
}

export async function logout(refreshToken?: string): Promise<void> {
  await apiClient.post("/auth/logout", { refreshToken });
}
