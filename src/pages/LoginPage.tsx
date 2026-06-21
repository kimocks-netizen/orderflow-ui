import { LoginForm } from "@/features/auth/LoginForm";
import { useAuthStore } from "@/stores/useAuthStore";
import type { AuthState } from "@/stores/useAuthStore";
import { Navigate } from "react-router-dom";
import { ROUTES } from "@/routes/routes";

export function LoginPage() {
  const isAuthenticated = useAuthStore((s: AuthState) => s.isAuthenticated);

  if (isAuthenticated) return <Navigate to={ROUTES.DASHBOARD} replace />;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-16 items-center">

        {/* Left — branding */}
        <aside className="hidden lg:flex flex-col gap-8">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-4">
              Internal Order<br />Management<br />System
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              Manage customer orders, track status transitions, and monitor fulfilment in real time — all from one place.
            </p>
          </div>
          <ul className="space-y-3">
            {[
              'Real-time order tracking',
              'Status transition management',
              'Fulfilment monitoring',
              'Operations dashboard',
            ].map(item => (
              <li key={item} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                <span className="text-base">{item}</span>
              </li>
            ))}
          </ul>
        </aside>

        {/* Right — login form */}
        <div className="flex flex-col items-center">
          <div className="w-full max-w-md">
            <div className="backdrop-blur-md bg-white/80 dark:bg-slate-900/70 border border-gray-300 dark:border-slate-700/50 rounded-2xl shadow-2xl p-10 transition-all duration-300 hover:shadow-3xl hover:-translate-y-2">
              <div className="text-center mb-8">
                <img src="/small-logo.png" alt="OrderFlow" className="h-14 object-contain mx-auto mb-5" />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Welcome back</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Sign in to manage your Orders...</p>
              </div>
              <LoginForm />
            </div>
            <p className="text-center text-xs text-gray-700 dark:text-gray-400 mt-6">
              OrderFlow — Internal Order Management System
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
