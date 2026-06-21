import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, PlusCircle, LogOut, Sun, Moon } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useThemeStore } from '@/stores/useThemeStore';
import { ROUTES } from '@/routes/routes';
import { Button } from '@/components/ui/button';

const navItems = [
  { to: ROUTES.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
  { to: ROUTES.ORDERS, icon: ShoppingCart, label: 'Orders' },
  { to: ROUTES.CREATE_ORDER, icon: PlusCircle, label: 'New Order' },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();

  const handleLogout = () => { logout(); navigate(ROUTES.LOGIN); };

  return (
    <aside className="w-56 shrink-0 flex flex-col h-full backdrop-blur-md bg-white/80 dark:bg-slate-900/90 border-r border-gray-200 dark:border-slate-700/50">
      {/* Logo */}
      <div className="flex items-center justify-center px-4 py-5 border-b border-gray-200 dark:border-slate-700/50">
        <Link to={ROUTES.DASHBOARD}>
          <img src="/logo.png" alt="OrderFlow" className="h-10 object-contain" />
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <Link key={to} to={to}>
              <div className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-900/8 dark:hover:bg-white/8'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom: user + actions */}
      <div className="px-3 pb-4 space-y-1 border-t border-gray-200 dark:border-slate-700/50 pt-3">
        <Button
          variant="ghost" size="sm"
          onClick={toggleTheme}
          className="w-full justify-start gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-900/8 dark:hover:bg-white/8"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {isDark ? 'Light mode' : 'Dark mode'}
        </Button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <div className="flex-1 text-left overflow-hidden">
            <p className="truncate">{user?.name ?? 'Sign out'}</p>
            {user?.email && <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>}
          </div>
        </button>
      </div>
    </aside>
  );
}
