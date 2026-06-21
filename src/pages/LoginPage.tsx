import { LoginForm } from "@/features/auth/LoginForm";
import { useAuthStore } from "@/stores/useAuthStore";
import type { AuthState } from "@/stores/useAuthStore";
import { Navigate } from "react-router-dom";
import { ROUTES } from "@/routes/routes";

export function LoginPage() {
  const isAuthenticated = useAuthStore((s: AuthState) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to={ROUTES.DASHBOARD} replace />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-6 mb-8">
          <img src="/logo.png" alt="OrderFlow" className="h-12" />
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to your account to continue</p>
          </div>
        </div>
        <div className="glass-card p-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
