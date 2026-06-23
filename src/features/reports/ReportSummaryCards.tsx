import { abbreviateCurrency } from "@/lib/utils";
import type { ReportsSummary, OrderTrendPoint } from "./api";

interface Props {
  data: ReportsSummary;
  totals: Pick<OrderTrendPoint, "all" | "pending" | "paid" | "shipped" | "cancelled">;
}

type CardVariant = "blue" | "green" | "purple" | "yellow" | "red" | "teal" | "indigo" | "orange" | "emerald" | "rose" | "sky" | "amber";

const VARIANT_STYLES: Record<CardVariant, { card: string; label: string; value: string; bar: string }> = {
  blue:    { card: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/50",       label: "text-blue-600/80 dark:text-blue-400/70",   value: "text-blue-900 dark:text-blue-100",   bar: "bg-blue-400 dark:bg-blue-500" },
  green:   { card: "bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800/50",   label: "text-green-600/80 dark:text-green-400/70", value: "text-green-900 dark:text-green-100", bar: "bg-green-400 dark:bg-green-500" },
  purple:  { card: "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/50", label: "text-purple-600/80 dark:text-purple-400/70", value: "text-purple-900 dark:text-purple-100", bar: "bg-purple-400 dark:bg-purple-500" },
  yellow:  { card: "bg-yellow-50 dark:bg-yellow-950/40 border-yellow-200 dark:border-yellow-800/50", label: "text-yellow-700/80 dark:text-yellow-400/70", value: "text-yellow-900 dark:text-yellow-100", bar: "bg-yellow-400 dark:bg-yellow-500" },
  red:     { card: "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/50",           label: "text-red-600/80 dark:text-red-400/70",     value: "text-red-900 dark:text-red-100",     bar: "bg-red-400 dark:bg-red-500" },
  teal:    { card: "bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800/50",       label: "text-teal-600/80 dark:text-teal-400/70",   value: "text-teal-900 dark:text-teal-100",   bar: "bg-teal-400 dark:bg-teal-500" },
  indigo:  { card: "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/50", label: "text-indigo-600/80 dark:text-indigo-400/70", value: "text-indigo-900 dark:text-indigo-100", bar: "bg-indigo-400 dark:bg-indigo-500" },
  orange:  { card: "bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800/50", label: "text-orange-600/80 dark:text-orange-400/70", value: "text-orange-900 dark:text-orange-100", bar: "bg-orange-400 dark:bg-orange-500" },
  emerald: { card: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50", label: "text-emerald-600/80 dark:text-emerald-400/70", value: "text-emerald-900 dark:text-emerald-100", bar: "bg-emerald-400 dark:bg-emerald-500" },
  rose:    { card: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/50",       label: "text-rose-600/80 dark:text-rose-400/70",   value: "text-rose-900 dark:text-rose-100",   bar: "bg-rose-400 dark:bg-rose-500" },
  sky:     { card: "bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800/50",           label: "text-sky-600/80 dark:text-sky-400/70",     value: "text-sky-900 dark:text-sky-100",     bar: "bg-sky-400 dark:bg-sky-500" },
  amber:   { card: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/50",   label: "text-amber-700/80 dark:text-amber-400/70", value: "text-amber-900 dark:text-amber-100", bar: "bg-amber-400 dark:bg-amber-500" },
};

function MetricCard({ label, value, variant }: { label: string; value: string; variant: CardVariant }) {
  const s = VARIANT_STYLES[variant];
  return (
    <div className={`rounded-xl border px-4 py-3.5 report-metric flex flex-col gap-1 ${s.card}`}>
      <div className={`h-0.5 w-8 rounded-full mb-1 ${s.bar}`} />
      <p className={`text-[11px] uppercase tracking-widest font-medium ${s.label}`}>{label}</p>
      <p className={`text-xl font-bold tabular-nums ${s.value}`}>{value}</p>
    </div>
  );
}

export function ReportSummaryCards({ data, totals }: Props) {
  const paidRate = totals.all > 0 ? Math.round((totals.paid / totals.all) * 100) : 0;
  const shippedRate = totals.all > 0 ? Math.round((totals.shipped / totals.all) * 100) : 0;

  const metrics: { label: string; value: string; variant: CardVariant }[] = [
    { label: "Total Orders",          value: totals.all.toLocaleString(),          variant: "blue" },
    { label: "Paid Orders",           value: totals.paid.toLocaleString(),          variant: "green" },
    { label: "Shipped Orders",        value: totals.shipped.toLocaleString(),       variant: "purple" },
    { label: "Pending Orders",        value: totals.pending.toLocaleString(),       variant: "yellow" },
    { label: "Cancelled Orders",      value: totals.cancelled.toLocaleString(),     variant: "red" },
    { label: "Cancellation Rate",     value: `${data.cancellationRate}%`,           variant: "rose" },
    { label: "Paid Rate",             value: `${paidRate}%`,                        variant: "emerald" },
    { label: "Shipped Rate",          value: `${shippedRate}%`,                     variant: "teal" },
    { label: "Revenue This Month",    value: abbreviateCurrency(data.revenueThisMonth), variant: "indigo" },
    { label: "Revenue Prev Month",    value: abbreviateCurrency(data.revenuePrevMonth), variant: "sky" },
    { label: "Avg Fulfilment",        value: `${data.avgFulfillmentDays} days`,     variant: "orange" },
    { label: "Peak Day Count",        value: data.peakDayCount.toLocaleString(),    variant: "amber" },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 report-metric-grid">
      {metrics.map((m) => (
        <MetricCard key={m.label} {...m} />
      ))}
    </div>
  );
}
