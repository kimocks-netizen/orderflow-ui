import { useDashboardQuery } from "@/features/dashboard/queries";
import { useRecentOrdersStore } from "@/stores/useRecentOrdersStore";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ROUTES } from "@/routes/routes";
import {
  ShoppingCart, DollarSign, TrendingUp, Clock,
  ArrowRight, BarChart2, Package, CheckCircle2, XCircle, Eye, CreditCard,
} from "lucide-react";
import type { OrderStatus } from "@/types/order";

const statusConfig: Record<
  OrderStatus,
  { label: string; icon: React.ElementType; color: string; bg: string; bar: string; badge: string }
> = {
  pending: {
    label: "Pending",
    icon: Clock,
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800/40",
    bar: "bg-yellow-400",
    badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  paid: {
    label: "Paid",
    icon: CheckCircle2,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/40",
    bar: "bg-blue-400",
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  shipped: {
    label: "Shipped",
    icon: Package,
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/40",
    bar: "bg-green-400",
    badge: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/40",
    bar: "bg-red-400",
    badge: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
};

const statusList: OrderStatus[] = ["pending", "paid", "shipped", "cancelled"];

export function DashboardPage() {
  const { data, isLoading, error } = useDashboardQuery();
  const recent = useRecentOrdersStore((s) => s.recent);

  if (isLoading) return <PageLoader />;
  if (error) return <p className="text-destructive text-sm">{error.message}</p>;
  if (!data) return null;

  const totalForBar = Math.max(data.total_orders, 1);
  const maxPerDay = Math.max(...(data.orders_per_day?.map((d) => d.count) ?? [1]), 1);

  const summaryCards = [
    {
      title: "Total Orders",
      value: data.total_orders.toLocaleString(),
      icon: ShoppingCart,
      description: "All time",
      accent: "text-blue-500",
      glow: "bg-blue-500/10",
    },
    {
      title: "Total Revenue",
      value: `$${data.total_revenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      description: "Excl. cancelled",
      accent: "text-emerald-500",
      glow: "bg-emerald-500/10",
    },
    {
      title: "Avg Order Value",
      value: `$${data.avg_order_value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: BarChart2,
      description: "Excl. cancelled",
      accent: "text-purple-500",
      glow: "bg-purple-500/10",
    },
    {
      title: "Orders Today",
      value: data.orders_today.toLocaleString(),
      icon: TrendingUp,
      description: "Last 24 hours",
      accent: "text-orange-500",
      glow: "bg-orange-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Overview of your order operations</p>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.title} className="glass-card border-0 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-default">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{card.title}</p>
                  <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{card.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${card.glow}`}>
                  <card.icon className={`h-5 w-5 ${card.accent}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Orders by Status */}
        <Card className="glass-card border-0 shadow-sm lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">Orders by Status</CardTitle>
              <Link
                to={ROUTES.ORDERS}
                className="flex items-center gap-1 text-xs text-primary hover:underline font-medium"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {statusList.map((status) => {
              const cfg = statusConfig[status];
              const count = data.orders_by_status[status];
              const pct = Math.round((count / totalForBar) * 100);
              return (
                <Link
                  key={status}
                  to={`${ROUTES.ORDERS}?status=${status}`}
                  className={`flex items-center gap-4 p-3 rounded-xl border transition-all hover:scale-[1.01] hover:shadow-sm ${cfg.bg}`}
                >
                  <div className={`p-2 rounded-lg bg-white/60 dark:bg-black/20`}>
                    <cfg.icon className={`h-4 w-4 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{count}</span>
                    </div>
                    <div className="h-1.5 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${cfg.bar} rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{pct}% of total</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                </Link>
              );
            })}
          </CardContent>
        </Card>

        {/* Orders per day sparkline */}
        <Card className="glass-card border-0 shadow-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">Orders per Day</CardTitle>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardHeader>
          <CardContent>
            {data.orders_per_day && data.orders_per_day.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-end gap-1.5 h-28">
                  {data.orders_per_day.map((day, i) => {
                    const heightPct = maxPerDay > 0 ? (day.count / maxPerDay) * 100 : 0;
                    const isToday = i === data.orders_per_day.length - 1;
                    return (
                      <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[10px] font-bold text-muted-foreground">{day.count > 0 ? day.count : ''}</span>
                        <div className="w-full flex items-end" style={{ height: '80px' }}>
                          <div
                            className={`w-full rounded-t-md transition-all duration-500 ${isToday ? 'bg-primary' : 'bg-primary/30'}`}
                            style={{ height: `${Math.max(heightPct, day.count > 0 ? 8 : 2)}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-muted-foreground">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="pt-2 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Today: <span className="font-semibold text-primary">{data.orders_today}</span> orders</span>
                  <span>7-day total: <span className="font-semibold text-foreground">{data.orders_per_day.reduce((s, d) => s + d.count, 0)}</span></span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No data</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="glass-card border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">Recent Activity</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Orders you recently viewed</p>
            </div>
            <Link to={ROUTES.ORDERS} className="flex items-center gap-1 text-xs text-primary hover:underline font-medium">
              All orders <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
              <Eye className="h-8 w-8 opacity-30" />
              <p className="text-sm">No recent activity yet</p>
              <p className="text-xs">Orders you open will appear here</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {recent.map((order, index) => {
                const statusIcons: Record<string, React.ElementType> = {
                  pending: Clock, paid: CreditCard, shipped: Package, cancelled: XCircle,
                };
                const statusCfg = statusConfig[order.status as OrderStatus];
                const Icon = statusIcons[order.status] ?? Clock;
                const viewedDate = new Date(order.viewedAt);
                const now = new Date();
                const diffMs = now.getTime() - viewedDate.getTime();
                const diffMins = Math.floor(diffMs / 60000);
                const timeAgo = diffMins < 1 ? 'Just now'
                  : diffMins < 60 ? `${diffMins}m ago`
                  : diffMins < 1440 ? `${Math.floor(diffMins / 60)}h ago`
                  : viewedDate.toLocaleDateString();

                return (
                  <div key={order.id}>
                    {index > 0 && <div className="border-t border-border/50 mx-3" />}
                    <Link
                      to={ROUTES.ORDER_DETAIL(order.id)}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl border border-transparent hover:bg-muted/50 hover:border-border hover:-translate-y-0.5 transition-all duration-150 group"
                    >
                      <div className={`p-2 rounded-lg ${statusCfg.bg}`}>
                        <Icon className={`h-4 w-4 ${statusCfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{order.customer_name}</p>
                          <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{timeAgo}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">#{order.id}</span>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-xs text-muted-foreground">${order.total_amount.toFixed(2)}</span>
                          <span className="text-muted-foreground">·</span>
                          <span className={`text-[10px] font-semibold capitalize px-1.5 py-0.5 rounded-full ${statusCfg.badge}`}>{order.status}</span>
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
