import { api } from "@/lib/api-client";
import type { LoginRequest, LoginResponse } from "@/types/auth";

export function loginApi(data: LoginRequest): Promise<LoginResponse> {
  return api.post<LoginResponse>("/auth/login", data);
}
