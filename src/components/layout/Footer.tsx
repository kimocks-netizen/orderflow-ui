import { GitBranch, Mail, LayoutDashboard, ShoppingCart, PlusCircle, Lock, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/routes';
import { useAuthStore } from '@/stores/useAuthStore';

export function Footer() {
  const { isAuthenticated } = useAuthStore();

  return (
    <footer className="backdrop-blur-md bg-white/60 dark:bg-slate-900/70 border-t border-gray-300 dark:border-slate-700/50 py-10 relative z-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="OrderFlow" className="h-12 object-contain" />
              {/* <span className="font-bold text-xl text-gray-900 dark:text-white">OrderFlow</span> */}
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
              An internal order management system for operations teams. Manage customer orders,
              track status transitions, and monitor fulfilment in real time.
            </p>
            <div className="flex gap-3">
              <a href="https://github.com/kimocks-netizen" target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-lg bg-primary/10 text-primary hover:scale-125 hover:rotate-12 transition-all duration-300">
                <GitBranch className="w-5 h-5" />
              </a>
              <a href="mailto:kimocks12@gmail.com"
                className="p-2 rounded-lg bg-primary/10 text-primary hover:scale-125 hover:rotate-12 transition-all duration-300">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base font-semibold mb-4 text-gray-900 dark:text-white">Quick Links</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm">
              <li className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                <Link to={ROUTES.LOGIN} className="hover:text-primary transition-all hover:translate-x-2 inline-block">Sign In</Link>
              </li>
              {isAuthenticated && (
                <>
                  <li className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4 text-primary" />
                    <Link to={ROUTES.DASHBOARD} className="hover:text-primary transition-all hover:translate-x-2 inline-block">Dashboard</Link>
                  </li>
                  <li className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-primary" />
                    <Link to={ROUTES.ORDERS} className="hover:text-primary transition-all hover:translate-x-2 inline-block">Orders</Link>
                  </li>
                  <li className="flex items-center gap-2">
                    <PlusCircle className="w-4 h-4 text-primary" />
                    <Link to={ROUTES.CREATE_ORDER} className="hover:text-primary transition-all hover:translate-x-2 inline-block">New Order</Link>
                  </li>
                  <li className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    <Link to={ROUTES.REPORTS} className="hover:text-primary transition-all hover:translate-x-2 inline-block">Reports</Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Stack */}
          <div>
            <h3 className="text-base font-semibold mb-4 text-gray-900 dark:text-white">Tech Stack</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm">
              {['React + Vite', 'TanStack Query', 'Zustand', 'SQLite + Express', 'shadcn/ui'].map(tech => (
                <li key={tech} className="hover:text-primary transition-all hover:translate-x-2 cursor-default">{tech}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-300 dark:border-slate-700/50 mt-8 pt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} OrderFlow — Full Stack Technical Assessment.{' '}
            Developed by{' '}
            <a href="mailto:kimocks12@gmail.com" className="text-primary font-semibold hover:underline">Bryne Kimocks</a>
            {' | '}
            <a href="https://github.com/kimocks-netizen" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              GitHub
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
