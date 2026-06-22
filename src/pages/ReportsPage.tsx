import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { useReportsQuery } from "@/features/reports/queries";
import type { ReportsParams } from "@/features/reports/api";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp, TrendingDown, PackageCheck, XCircle,
  Clock, DollarSign, Users, AlertTriangle, CalendarDays,
} from "lucide-react";

type SeriesKey = "all" | "pending" | "paid" | "shipped" | "cancelled";

const SERIES: { key: SeriesKey; label: string; color: string }[] = [
  { key: "all",       label: "All",       color: "#60a5fa" },
  { key: "pending",   label: "Pending",   color: "#fbbf24" },
  { key: "paid",      label: "Paid",      color: "#34d399" },
  { key: "shipped",   label: "Shipped",   color: "#a78bfa" },
  { key: "cancelled", label: "Cancelled", color: "#f87171" },
];

export function ReportsPage() {
  const [params] = useState<ReportsParams>({});
  const { data, isLoading, error } = useReportsQuery(params);
  const [hidden, setHidden] = useState<Set<SeriesKey>>(new Set());

  const toggleSeries = (key: SeriesKey) =>
    setHidden((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  if (isLoading) return <PageLoader />;
  if (error) return <p className="text-destructive text-sm">{error.message}</p>;
  if (!data) return null;

  const revenueChange = data.revenuePrevMonth > 0
    ? Math.round(((data.revenueThisMonth - data.revenuePrevMonth) / data.revenuePrevMonth) * 100)
    : null;

  const chartData = data.trend.map((d) => ({
    ...d,
    label: new Date(d.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Reports & Analyses</h1>
        <p className="text-sm text-muted-foreground mt-0.5">30-day order trends and operational insights</p>
      </div>

      {/* Line chart */}
      <Card className="glass-card border-0 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">Orders Over Time</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Last 30 days — click legend labels to show/hide a series</p>
            </div>
            {/* Filter pills */}
            <div className="flex flex-wrap gap-2">
              {SERIES.map((s) => {
                const isHidden = hidden.has(s.key);
                return (
                  <button
                    key={s.key}
                    onClick={() => toggleSeries(s.key)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-150 ${
                      isHidden
                        ? "border-border text-muted-foreground bg-transparent line-through opacity-50"
                        : "border-transparent text-white"
                    }`}
                    style={isHidden ? {} : { backgroundColor: s.color, borderColor: s.color }}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.08} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "currentColor", opacity: 0.5 }}
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "currentColor", opacity: 0.5 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "0.5rem",
                    fontSize: 12,
                  }}
                  labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
                  onClick={(e) => toggleSeries(e.dataKey as SeriesKey)}
                  formatter={(value, entry) => (
                    <span style={{ color: hidden.has(entry.dataKey as SeriesKey) ? "#9ca3af" : entry.color, textDecoration: hidden.has(entry.dataKey as SeriesKey) ? "line-through" : "none" }}>
                      {value}
                    </span>
                  )}
                />
                {SERIES.map((s) => (
                  <Line
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    name={s.label}
                    stroke={s.color}
                    strokeWidth={s.key === "all" ? 2.5 : 1.5}
                    dot={false}
                    activeDot={{ r: 4 }}
                    hide={hidden.has(s.key)}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card className="glass-card border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

            {/* Revenue vs last month */}
            <InsightCard
              icon={DollarSign}
              color={revenueChange !== null && revenueChange >= 0 ? "success" : "error"}
              title={
                revenueChange !== null
                  ? `Revenue ${revenueChange >= 0 ? "up" : "down"} ${Math.abs(revenueChange)}% MoM`
                  : "Revenue this month"
              }
              body={
                revenueChange !== null
                  ? `$${data.revenueThisMonth.toFixed(2)} this month vs $${data.revenuePrevMonth.toFixed(2)} last month.`
                  : `$${data.revenueThisMonth.toFixed(2)} in revenue so far this month.`
              }
            />

            {/* Cancellation rate */}
            <InsightCard
              icon={data.cancellationRate > 20 ? AlertTriangle : XCircle}
              color={data.cancellationRate > 20 ? "warning" : data.cancellationRate > 10 ? "error" : "success"}
              title={`${data.cancellationRate}% cancellation rate`}
              body={
                data.cancellationRate > 20
                  ? "High cancellation rate — review order validation or fulfilment issues."
                  : data.cancellationRate > 10
                  ? "Moderate cancellations. Consider investigating common reasons."
                  : "Cancellation rate is healthy. Operations are running smoothly."
              }
            />

            {/* Avg fulfilment */}
            <InsightCard
              icon={PackageCheck}
              color="primary"
              title={`Avg fulfilment: ${data.avgFulfillmentDays} days`}
              body="Average time from order creation to shipped status across fulfilled orders."
            />

            {/* Peak day */}
            <InsightCard
              icon={CalendarDays}
              color="primary"
              title={`Peak day: ${data.peakDay ? new Date(data.peakDay + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }) : "N/A"}`}
              body={`${data.peakDayCount} order${data.peakDayCount !== 1 ? "s" : ""} placed on the busiest day in the last 30 days.`}
            />

            {/* Trend direction */}
            {(() => {
              const last7 = data.trend.slice(-7).reduce((s, d) => s + d.all, 0);
              const prev7 = data.trend.slice(-14, -7).reduce((s, d) => s + d.all, 0);
              const diff = prev7 > 0 ? Math.round(((last7 - prev7) / prev7) * 100) : 0;
              const up = diff >= 0;
              return (
                <InsightCard
                  icon={up ? TrendingUp : TrendingDown}
                  color={up ? "success" : "warning"}
                  title={`Orders ${up ? "up" : "down"} ${Math.abs(diff)}% (7-day)`}
                  body={`${last7} orders in the last 7 days vs ${prev7} the prior 7 days.`}
                />
              );
            })()}

            {/* Top customer */}
            {data.topCustomers[0] && (
              <InsightCard
                icon={Users}
                color="primary"
                title={`Top customer: ${data.topCustomers[0].name}`}
                body={`${data.topCustomers[0].orders} order${data.topCustomers[0].orders !== 1 ? "s" : ""} — $${data.topCustomers[0].total.toFixed(2)} total spend.`}
              />
            )}

            {/* Pending backlog */}
            {(() => {
              const pendingTotal = data.trend.reduce((s, d) => s + d.pending, 0);
              return (
                <InsightCard
                  icon={Clock}
                  color={pendingTotal > 20 ? "warning" : "success"}
                  title={`${pendingTotal} pending order${pendingTotal !== 1 ? "s" : ""} (30d)`}
                  body={
                    pendingTotal > 20
                      ? "Large pending backlog detected. Ensure operations team is processing orders."
                      : "Pending order count looks manageable."
                  }
                />
              );
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Top customers table */}
      {data.topCustomers.length > 0 && (
        <Card className="glass-card border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">Top Customers</CardTitle>
            <p className="text-xs text-muted-foreground">By number of orders placed</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3 text-right">Orders</th>
                    <th className="px-5 py-3 text-right">Total Spend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {data.topCustomers.map((c, i) => (
                    <tr key={c.email} className="hover:bg-muted/40 transition-colors">
                      <td className="px-5 py-3 font-medium flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        {c.name}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{c.email}</td>
                      <td className="px-5 py-3 text-right font-semibold">{c.orders}</td>
                      <td className="px-5 py-3 text-right font-semibold text-gray-900 dark:text-white">
                        ${c.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

type InsightColor = "success" | "error" | "warning" | "primary";

function InsightCard({
  icon: Icon, color, title, body,
}: {
  icon: React.ElementType;
  color: InsightColor;
  title: string;
  body: string;
}) {
  const styles: Record<InsightColor, { wrap: string; icon: string }> = {
    success: { wrap: "bg-green-50 dark:bg-green-900/15 border-green-200 dark:border-green-800/40", icon: "text-green-600 dark:text-green-400" },
    error:   { wrap: "bg-red-50 dark:bg-red-900/15 border-red-200 dark:border-red-800/40",       icon: "text-red-600 dark:text-red-400" },
    warning: { wrap: "bg-yellow-50 dark:bg-yellow-900/15 border-yellow-200 dark:border-yellow-800/40", icon: "text-yellow-600 dark:text-yellow-400" },
    primary: { wrap: "bg-blue-50 dark:bg-blue-900/15 border-blue-200 dark:border-blue-800/40",   icon: "text-blue-600 dark:text-blue-400" },
  };
  const s = styles[color];
  return (
    <div className={`flex items-start gap-3 rounded-xl border p-4 ${s.wrap}`}>
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${s.icon}`} />
      <div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{body}</p>
      </div>
    </div>
  );
}
