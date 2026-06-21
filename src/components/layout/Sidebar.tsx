import { NavLink } from "react-router-dom";
import { LayoutDashboard, ShoppingCart, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { ROUTES } from "@/routes/routes";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { to: ROUTES.DASHBOARD, icon: LayoutDashboard, label: "Dashboard" },
  { to: ROUTES.ORDERS, icon: ShoppingCart, label: "Orders" },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex flex-col h-full border-r bg-card transition-all duration-200",
        collapsed ? "w-16" : "w-56"
      )}
    >
      <div className="flex items-center justify-between h-16 px-3 border-b shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <img src="/small-logo.png" alt="logo" className="h-7 w-7 shrink-0" />
            <span className="font-semibold text-sm truncate">OrderFlow</span>
          </div>
        )}
        {collapsed && <img src="/small-logo.png" alt="logo" className="h-7 w-7 mx-auto" />}
        <button
          onClick={onToggle}
          className="ml-auto p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex flex-col gap-1 p-2 flex-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
