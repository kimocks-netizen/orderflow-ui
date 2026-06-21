import { Outlet, Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Sun, Moon, Home, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Footer } from './Footer';
import Mask from '@/components/Mask';
import { useThemeStore } from '@/stores/useThemeStore';
import { ROUTES } from '@/routes/routes';

export function PublicLayout() {
  const { isDark, toggleTheme } = useThemeStore();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const navLink = (to: string, label: string, icon: React.ReactNode) => {
    const isActive = pathname === to;
    return (
      <Link
        to={to}
        className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md transition-all ${
          isActive
            ? 'bg-primary text-primary-foreground shadow'
            : 'text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-white/10'
        }`}
      >
        {icon}
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <img src="/bg-images/bg-light.png" alt="" className="w-full h-full object-cover dark:hidden" />
        <img src="/bg-images/bg-dark.png" alt="" className="w-full h-full object-cover hidden dark:block" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-indigo-950/85 to-purple-950/90 hidden dark:block" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-indigo-500/25 to-purple-500/30 dark:hidden" />
      </div>

      <Mask particleCount={100} />

      {/* Public nav */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-white/70 dark:bg-slate-900/40 border-b border-gray-300 dark:border-slate-700/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/">
            <img src="/logo.png" alt="OrderFlow" className="h-9 object-contain" />
          </Link>
          <div className="flex items-center gap-2">
            {navLink('/', 'Home', <Home className="h-4 w-4" />)}
            {navLink(ROUTES.LOGIN, 'Sign In', <Lock className="h-4 w-4" />)}
            <Button
              variant="ghost" size="icon"
              onClick={toggleTheme}
              className="rounded-full bg-white/20 dark:bg-white/10 hover:bg-white/30 dark:hover:bg-white/20 text-gray-900 dark:text-white ml-1"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1 relative z-10 pt-16">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
