import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, PlusCircle, LogOut, Sun, Moon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useThemeStore } from '@/stores/useThemeStore';
import { ROUTES } from '@/routes/routes';
import { Button } from '@/components/ui/button';

const navItems = [
  { to: ROUTES.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
  { to: ROUTES.ORDERS,    icon: ShoppingCart,    label: 'Orders' },
  { to: ROUTES.CREATE_ORDER, icon: PlusCircle,   label: 'New Order' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();

  const handleLogout = () => { logout(); navigate(ROUTES.LOGIN); };

  return (
    <aside className={`${collapsed ? 'w-14' : 'w-56'} shrink-0 flex flex-col h-full backdrop-blur-md bg-white/80 dark:bg-slate-900/90 border-r border-gray-200 dark:border-slate-700/50 transition-all duration-300`}>

      {/* Logo + toggle */}
      <div className={`flex items-center border-b border-gray-200 dark:border-slate-700/50 h-14 ${collapsed ? 'justify-center px-0' : 'justify-between px-4'}`}>
        {!collapsed && (
          <Link to={ROUTES.DASHBOARD}>
            <img src="/logo.png" alt="OrderFlow" className="h-8 object-contain" />
          </Link>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-900/8 dark:hover:bg-white/8 transition-colors"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav items */}
      <nav className={`flex-1 py-3 space-y-1 overflow-y-auto ${collapsed ? 'px-2' : 'px-3'}`}>
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <div key={to} className="relative group">
              <Link to={to}>
                <div className={`flex items-center rounded-lg text-sm font-medium transition-all duration-150 ${
                  collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
                } ${
                  isActive
                    ? 'bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/8 hover:text-gray-900 dark:hover:text-gray-100'
                }`}>
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : ''}`} />
                  {!collapsed && <span className="flex-1">{label}</span>}
                  {!collapsed && isActive && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                </div>
              </Link>
              {/* Tooltip when collapsed */}
              {collapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 bg-gray-900 dark:bg-slate-700 text-white text-xs rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-lg">
                  {label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-slate-700" />
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className={`border-t border-gray-200 dark:border-slate-700/50 py-3 space-y-1 ${collapsed ? 'px-2' : 'px-3'}`}>
        {/* Theme toggle */}
        <div className="relative group">
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/8 hover:text-gray-900 dark:hover:text-gray-100 transition-colors ${
              collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
            }`}
          >
            {isDark ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
            {!collapsed && <span>{isDark ? 'Light mode' : 'Dark mode'}</span>}
          </button>
          {collapsed && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 bg-gray-900 dark:bg-slate-700 text-white text-xs rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-lg">
              {isDark ? 'Light mode' : 'Dark mode'}
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-slate-700" />
            </div>
          )}
        </div>

        {/* Logout */}
        <div className="relative group">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors ${
              collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
            }`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && (
              <div className="flex-1 text-left overflow-hidden">
                <p className="truncate">{user?.name ?? 'Sign out'}</p>
                {user?.email && <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>}
              </div>
            )}
          </button>
          {collapsed && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 bg-gray-900 dark:bg-slate-700 text-white text-xs rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-lg">
              Sign out
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-slate-700" />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
