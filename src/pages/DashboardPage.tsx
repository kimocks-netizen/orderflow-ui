import { useDashboardQuery } from "@/features/dashboard/queries";
import { useRecentOrdersStore } from "@/stores/useRecentOrdersStore";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useState } from "react";
import { ROUTES } from "@/routes/routes";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  ShoppingCart, DollarSign, TrendingUp, Clock,
  ArrowRight, BarChart2, Package, CheckCircle2, XCircle, Eye, CreditCard, User,
} from "lucide-react";
import type { OrderStatus } from "@/types/order";
import { formatCurrency, abbreviateCurrency } from "@/lib/utils";

function NamePopover({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const LIMIT = 30;
  const needsTruncation = name.length > LIMIT;
  const truncated = needsTruncation ? name.slice(0, LIMIT) + "\u2026" : name;
  return (
    <div className="relative min-w-0 flex-1 overflow-hidden">
      <span
        className={`text-sm font-semibold text-gray-900 dark:text-white${needsTruncation ? " cursor-pointer underline decoration-dotted underline-offset-2" : ""}`}
        onMouseEnter={() => needsTruncation && setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {truncated}
      </span>
      {open && (
        <div className="absolute z-50 top-full left-0 mt-2 w-64 max-h-24 overflow-y-auto px-3 py-2 rounded-lg bg-popover border border-border text-popover-foreground text-xs shadow-xl break-all">
          <div className="flex items-start gap-2">
            <User className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" />
            <span>{name}</span>
          </div>
          <div className="absolute bottom-full left-4 border-4 border-transparent border-b-border" />
        </div>
      )}
    </div>
  );
}

function CountDisplay({ value }: { value: number }) {
  const [open, setOpen] = useState(false);
  const abbreviated = value >= 1e18
    ? (() => { const exp = Math.floor(Math.log10(value)); return `${parseFloat((value / Math.pow(10, exp)).toFixed(2))}×10^${exp}`; })()
    : value >= 1e15 ? `${parseFloat((value / 1e15).toFixed(2))}Q`
    : value >= 1e12 ? `${parseFloat((value / 1e12).toFixed(2))}T`
    : value >= 1e9  ? `${parseFloat((value / 1e9).toFixed(2))}B`
    : value >= 1e6  ? `${parseFloat((value / 1e6).toFixed(2))}M`
    : value >= 1e3  ? `${parseFloat((value / 1e3).toFixed(2))}K`
    : value.toLocaleString();
  const full = value.toLocaleString();
  const needsAbbrev = abbreviated !== full;
  return (
    <span className="relative inline-block">
      <span
        className={needsAbbrev ? "cursor-pointer underline decoration-dotted underline-offset-2" : ""}
        onMouseEnter={() => needsAbbrev && setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {abbreviated}
      </span>
      {open && (
        <span className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 rounded-lg bg-popover border border-border text-popover-foreground text-xs font-normal shadow-xl whitespace-nowrap">
          {full}
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-border" />
        </span>
      )}
    </span>
  );
}

function AmountDisplay({ amount }: { amount: number }) {
  const [open, setOpen] = useState(false);
  const abbreviated = abbreviateCurrency(amount);
  const full = formatCurrency(amount);
  const needsAbbrev = abbreviated !== full;
  return (
    <span className="relative inline-block">
      <span
        className={needsAbbrev ? "cursor-pointer underline decoration-dotted underline-offset-2" : ""}
        onMouseEnter={() => needsAbbrev && setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {abbreviated}
      </span>
      {open && (
        <span className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 rounded-lg bg-popover border border-border text-popover-foreground text-xs font-normal shadow-xl whitespace-nowrap">
          {full}
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-border" />
        </span>
      )}
    </span>
  );
}

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
  const weekTotal = data.orders_per_day?.reduce((s, d) => s + d.count, 0) ?? 0;

  const chartData = data.orders_per_day?.map((d, i) => ({
    ...d,
    label: new Date(d.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" }),
    isToday: i === (data.orders_per_day.length - 1),
    pct: weekTotal > 0 ? Math.round((d.count / weekTotal) * 100) : 0,
  })) ?? [];

  const summaryCards = [
    {
      title: "Total Orders",
      raw: data.total_orders,
      type: "count" as const,
      icon: ShoppingCart,
      description: "All time",
      accent: "text-blue-500",
      glow: "bg-blue-500/10",
    },
    {
      title: "Total Revenue",
      raw: data.total_revenue,
      type: "amount" as const,
      icon: DollarSign,
      description: "Excl. cancelled",
      accent: "text-emerald-500",
      glow: "bg-emerald-500/10",
    },
    {
      title: "Avg Order Value",
      raw: data.avg_order_value,
      type: "amount" as const,
      icon: BarChart2,
      description: "Excl. cancelled",
      accent: "text-purple-500",
      glow: "bg-purple-500/10",
    },
    {
      title: "Orders Today",
      raw: data.orders_today,
      type: "count" as const,
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
                  <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                    {card.type === "amount"
                      ? <AmountDisplay amount={card.raw} />
                      : <CountDisplay value={card.raw} />}
                  </p>
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

        {/* Orders per day */}
        <Card className="glass-card border-0 shadow-sm lg:col-span-2">
          <CardHeader className="pb-1">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">Orders per Day</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Last 7 days</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900 dark:text-white">{weekTotal}</p>
                <p className="text-[10px] text-muted-foreground">week total</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2 pb-3">
            {chartData.length > 0 ? (
              <>
                <div className="h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} vertical={false} />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 10, fill: "currentColor", opacity: 0.5 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "currentColor", opacity: 0.5 }}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                        width={28}
                      />
                      <Tooltip
                        cursor={{ fill: "currentColor", opacity: 0.04 }}
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0].payload;
                          return (
                            <div className="bg-card border border-border rounded-lg shadow-lg px-3 py-2.5 text-xs space-y-1 min-w-[130px]">
                              <p className="font-semibold text-foreground text-[11px]">
                                {new Date(d.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                              </p>
                              <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">Orders</span>
                                <span className="font-bold text-foreground">{d.count}</span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">% of week</span>
                                <span className="font-semibold text-primary">{d.pct}%</span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">Week total</span>
                                <span className="font-semibold text-foreground">{weekTotal}</span>
                              </div>
                              {d.isToday && <p className="text-[10px] text-primary font-semibold pt-0.5">Today</p>}
                            </div>
                          );
                        }}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={36}>
                        {chartData.map((d) => (
                          <Cell key={d.date} fill={d.isToday ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.35)"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Today: <span className="font-semibold text-primary">{data.orders_today}</span></span>
                  <span>Avg/day: <span className="font-semibold text-foreground">{(weekTotal / 7).toFixed(1)}</span></span>
                  <span>Peak: <span className="font-semibold text-foreground">{Math.max(...chartData.map(d => d.count))}</span></span>
                </div>
              </>
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
                        <div className="flex items-center justify-between gap-2">
                          <NamePopover name={order.customer_name} />
                          <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">#{order.id}</span>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-xs text-muted-foreground">{abbreviateCurrency(order.total_amount)}</span>
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
