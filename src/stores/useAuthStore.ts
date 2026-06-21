import { create } from "zustand";
import { getToken, setToken, clearToken } from "@/lib/api-client";
import type { User } from "@/types/auth";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  hydrate: () => void;
}

const USER_KEY = "orderflow_user";

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!getToken(),

  setAuth: (user, token) => {
    setToken(token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    clearToken();
    localStorage.removeItem(USER_KEY);
    set({ user: null, isAuthenticated: false });
  },

  hydrate: () => {
    const token = getToken();
    const stored = localStorage.getItem(USER_KEY);
    if (token && stored) {
      try {
        set({ user: JSON.parse(stored), isAuthenticated: true });
      } catch {
        clearToken();
        localStorage.removeItem(USER_KEY);
      }
    }
  },
}));
