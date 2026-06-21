import { create } from "zustand";

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
}

function getInitialTheme(): boolean {
  const stored = localStorage.getItem("theme");
  if (stored) return stored === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(isDark: boolean) {
  document.documentElement.classList.toggle("dark", isDark);
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

export const useThemeStore = create<ThemeState>(() => {
  const isDark = getInitialTheme();
  applyTheme(isDark);
  return {
    isDark,
    toggleTheme: () =>
      useThemeStore.setState((s) => {
        applyTheme(!s.isDark);
        return { isDark: !s.isDark };
      }),
  };
});
