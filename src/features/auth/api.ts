import { api } from "@/lib/api-client";
import { mockApi, isMock } from "@/mocks/mockApi";
import type { LoginRequest, LoginResponse } from "@/types/auth";

export function loginApi(data: LoginRequest): Promise<LoginResponse> {
  if (isMock) return mockApi.login(data);
  return api.post<LoginResponse>("/auth/login", data);
}
