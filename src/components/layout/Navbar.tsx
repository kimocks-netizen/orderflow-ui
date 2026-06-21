import { Link } from 'react-router-dom';
import { Sun, Moon, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useThemeStore } from '@/stores/useThemeStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { ROUTES } from '@/routes/routes';

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { isDark, toggleTheme } = useThemeStore();
  const { isAuthenticated } = useAuthStore();

  return (
    <nav className="md:hidden backdrop-blur-md bg-white/80 dark:bg-slate-900/30 border-b border-gray-300 dark:border-slate-700/50 shadow-lg sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-2">
        <Link to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.LOGIN}>
          <img src="/logo.png" alt="OrderFlow" className="h-11 object-contain" />
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme}
            className="rounded-full bg-white/20 dark:bg-white/10 text-gray-900 dark:text-white"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {onMenuClick && (
            <Button variant="ghost" size="icon" onClick={onMenuClick}
              className="rounded-full bg-white/20 dark:bg-white/10 text-gray-900 dark:text-white"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
