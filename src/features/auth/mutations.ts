import { useMutation } from "@tanstack/react-query";
import { loginApi } from "./api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { LoginRequest } from "@/types/auth";

import type { AuthState } from "@/stores/useAuthStore";

export function useLoginMutation() {
  const setAuth = useAuthStore((s: AuthState) => s.setAuth);
  return useMutation({
    mutationFn: (data: LoginRequest) => loginApi(data),
    onSuccess: (res) => {
      setAuth(res.user, res.access_token);
    },
  });
}
