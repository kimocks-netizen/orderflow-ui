import { useParams, useNavigate } from "react-router-dom";
import { useOrderQuery, useOrderHistoryQuery } from "@/features/orders/queries";
import { useUpdateOrderStatus } from "@/features/orders/mutations";
import { PageHeader } from "@/components/shared/PageHeader";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/routes/routes";
import { useEffect, useState } from "react";
import { useRecentOrdersStore } from "@/stores/useRecentOrdersStore";
import { formatCurrency } from "@/lib/utils";
import {
  Clock, CreditCard, Package, CheckCircle2, XCircle,
  ArrowRight, ChevronRight, ChevronLeft, User, Mail, DollarSign, CalendarDays,
} from "lucide-react";
import type { OrderStatus, StatusHistoryEntry } from "@/types/order";

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid", "cancelled"],
  paid: ["shipped", "cancelled"],
  shipped: [],
  cancelled: [],
};

const LIFECYCLE: { status: OrderStatus; label: string; description: string; icon: React.ElementType }[] = [
  { status: "pending",  label: "Order Placed",      description: "Awaiting payment", icon: Clock },
  { status: "paid",     label: "Payment Received",  description: "Ready to ship",    icon: CreditCard },
  { status: "shipped",  label: "Shipped",            description: "On the way",       icon: Package },
];

const statusColors: Record<OrderStatus, { text: string; badge: string; bg: string }> = {
  pending:   { text: "text-yellow-700 dark:text-yellow-400", badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800/40" },
  paid:      { text: "text-blue-700 dark:text-blue-400",     badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",         bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/40" },
  shipped:   { text: "text-green-700 dark:text-green-400",   badge: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",     bg: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/40" },
  cancelled: { text: "text-red-700 dark:text-red-400",       badge: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",             bg: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/40" },
};

const transitionConfig: Record<OrderStatus, { label: string; variant: "default" | "destructive"; icon: React.ElementType }> = {
  paid:      { label: "Mark as Paid",      variant: "default",      icon: CreditCard },
  shipped:   { label: "Mark as Shipped",   variant: "default",      icon: Package },
  cancelled: { label: "Cancel Order",      variant: "destructive",  icon: XCircle },
  pending:   { label: "Revert to Pending", variant: "default",      icon: Clock },
};

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading, error } = useOrderQuery(id!);
  const { data: history } = useOrderHistoryQuery(id!);
  const { mutate, isPending } = useUpdateOrderStatus(id!);
  const track = useRecentOrdersStore((s) => s.track);

  useEffect(() => { if (order) track(order); }, [order?.id]);

  if (isLoading) return <PageLoader />;
  if (error) return <p className="text-destructive text-sm">{error.message}</p>;
  if (!order) return null;

  const isCancelled = order.status === "cancelled";
  const currentStep = LIFECYCLE.findIndex((s) => s.status === order.status);
  const nextStatuses = TRANSITIONS[order.status];
  const colors = statusColors[order.status];

  return (
    <div>
      <PageHeader
        title={`Order #${order.id}`}
        breadcrumbs={[
          { label: "Orders", href: ROUTES.ORDERS },
          { label: `#${order.id}` },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.ORDERS)} className="gap-1">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Order summary card */}
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row gap-0">
                {/* Product image placeholder */}
                <div className="sm:w-48 shrink-0 flex items-center justify-center bg-muted/40 rounded-t-xl sm:rounded-l-xl sm:rounded-tr-none p-6 border-b sm:border-b-0 sm:border-r border-border">
                    <img src="/no-image.png" alt="No product image" className="w-32 h-32 object-contain opacity-60" />
                </div>

                {/* Order info */}
                <div className="flex-1 p-5 flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Order</p>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">#{order.id}</h2>
                    </div>
                    <span className={`text-xs font-semibold capitalize px-3 py-1 rounded-full border ${colors.badge} ${colors.bg}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <InfoRow icon={User} label="Customer" value={order.customer_name} isName />
                    <InfoRow icon={Mail} label="Email" value={order.customer_email} isEmail />
                    <InfoRow icon={DollarSign} label="Total" value={formatCurrency(order.total_amount)} />
                    <InfoRow icon={CalendarDays} label="Placed" value={new Date(order.created_at).toLocaleDateString()} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order pipeline */}
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Order Progress</CardTitle>
            </CardHeader>
            <CardContent>
              {isCancelled ? (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40">
                  <div className="p-2.5 rounded-full bg-red-100 dark:bg-red-900/40">
                    <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-red-700 dark:text-red-400">Order Cancelled</p>
                    <p className="text-sm text-red-600/70 dark:text-red-400/70">This order has been cancelled and cannot be updated.</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start">
                  {LIFECYCLE.map((step, index) => {
                    const isDone = index < currentStep || order.status === "shipped";
                    const isActive = index === currentStep && order.status !== "shipped";
                    const isFuture = index > currentStep;
                    const isLast = index === LIFECYCLE.length - 1;
                    const Icon = step.icon;
                    return (
                      <div key={step.status} className="flex-1 flex flex-col items-center relative">
                        {!isLast && (
                          <div className="absolute top-5 left-1/2 w-full h-0.5 z-0">
                            <div className={`h-full transition-all duration-500 ${isDone ? "bg-primary" : "bg-gray-200 dark:bg-slate-700"}`} />
                          </div>
                        )}
                        <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 hover:scale-110 cursor-default ${
                          isDone ? "bg-primary border-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/30"
                            : isActive ? "bg-primary border-primary text-primary-foreground ring-4 ring-primary/20 hover:shadow-lg hover:shadow-primary/30"
                            : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-500 hover:border-primary/50"
                        }`}>
                          {isDone ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                        </div>
                        <div className="mt-2 text-center px-1">
                          <p className={`text-xs font-semibold ${isFuture ? "text-muted-foreground" : "text-gray-900 dark:text-white"}`}>{step.label}</p>
                          <p className={`text-[10px] mt-0.5 ${isFuture ? "text-muted-foreground/60" : "text-muted-foreground"}`}>{step.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {!isCancelled && nextStatuses.filter(s => s !== "cancelled").length > 0 && (
                <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
                  <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                  <span>Next: <span className="font-semibold text-foreground capitalize">{nextStatuses.find(s => s !== "cancelled")}</span> — update using the actions panel.</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status history */}
          {history && history.length > 0 && (
            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Status History</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="flex flex-col gap-2">
                  {history.map((entry: StatusHistoryEntry, i: number) => {
                    const isLatest = i === history.length - 1;
                    const colors = statusColors[entry.to_status];
                    const ToIcon = LIFECYCLE.find(s => s.status === entry.to_status)?.icon ?? (entry.to_status === "cancelled" ? XCircle : CheckCircle2);
                    return (
                      <li key={entry.id} className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${isLatest ? "bg-muted/40 border-border" : "border-transparent"}`}>
                        <div className={`mt-0.5 p-1.5 rounded-full shrink-0 ${colors.badge}`}>
                          <ToIcon className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            {entry.from_status && (
                              <>
                                <span className={`text-xs font-medium capitalize px-2 py-0.5 rounded-full ${statusColors[entry.from_status].badge}`}>{entry.from_status}</span>
                                <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                              </>
                            )}
                            <span className={`text-xs font-medium capitalize px-2 py-0.5 rounded-full ${colors.badge}`}>{entry.to_status}</span>
                            {isLatest && <span className="text-[10px] text-primary font-semibold">Current</span>}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-1">{new Date(entry.changed_at).toLocaleString()}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Actions */}
          {nextStatuses.length > 0 && (
            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {nextStatuses.map((s) => {
                  const cfg = transitionConfig[s];
                  const Icon = cfg.icon;
                  return (
                    <Button key={s} variant={cfg.variant} size="sm" disabled={isPending}
                      onClick={() => mutate({ status: s })}
                      className="w-full justify-start gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {cfg.label}
                    </Button>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Order details */}
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Order Details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Row label="Order ID" value={`#${order.id}`} />
              <Row label="Customer" value={order.customer_name} isName />
              <Row label="Email" value={order.customer_email} isEmail />
              <div className="border-t border-border my-1" />
              <Row label="Total Amount" value={formatCurrency(order.total_amount)} bold />
              <div className="border-t border-border my-1" />
              <Row label="Created" value={new Date(order.created_at).toLocaleString()} />
              <Row label="Last Updated" value={new Date(order.updated_at).toLocaleString()} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function truncateEmail(email: string): string {
  if (email.length <= 25) return email;
  const atIndex = email.lastIndexOf("@");
  const domain = atIndex !== -1 ? email.slice(atIndex) : "";
  const local = atIndex !== -1 ? email.slice(0, atIndex) : email;
  const budget = 25 - domain.length - 1;
  return budget > 0 ? local.slice(0, budget) + "\u2026" + domain : email.slice(0, 24) + "\u2026";
}

function NamePopover({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const LIMIT = 30;
  const needsTruncation = name.length > LIMIT;
  const truncated = needsTruncation ? name.slice(0, LIMIT) + "\u2026" : name;
  return (
    <div className="relative min-w-0">
      <span
        className={`text-sm font-medium text-gray-900 dark:text-white${needsTruncation ? " cursor-pointer underline decoration-dotted underline-offset-2" : ""}`}
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

function EmailPopover({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const truncated = truncateEmail(email);
  const needsTruncation = email.length > 25;
  return (
    <div className="relative min-w-0">
      <span
        className={`text-sm font-medium text-gray-900 dark:text-white${needsTruncation ? " cursor-pointer underline decoration-dotted underline-offset-2" : ""}`}
        onMouseEnter={() => needsTruncation && setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {truncated}
      </span>
      {open && (
        <div className="absolute z-50 top-full left-0 mt-2 w-64 max-h-24 overflow-y-auto px-3 py-2 rounded-lg bg-popover border border-border text-popover-foreground text-xs shadow-xl break-all">
          <div className="flex items-start gap-2">
            <Mail className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" />
            <span>{email}</span>
          </div>
          <div className="absolute bottom-full left-4 border-4 border-transparent border-b-border" />
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, isEmail, isName }: { icon: React.ElementType; label: string; value: string; isEmail?: boolean; isName?: boolean }) {
  const displayName = !isEmail && !isName && value.length > 15 ? value.slice(0, 15) + "\u2026" : value;
  return (
    <div className="flex items-start gap-2">
      <div className="p-1.5 rounded-md bg-primary/10 shrink-0 mt-0.5">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
        {isEmail
          ? <EmailPopover email={value} />
          : isName
          ? <NamePopover name={value} />
          : <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={value.length > 15 ? value : undefined}>{displayName}</p>
        }
      </div>
    </div>
  );
}

function Row({ label, value, bold, isEmail, isName }: { label: string; value: string; bold?: boolean; isEmail?: boolean; isName?: boolean }) {
  return (
    <div className="flex justify-between text-sm gap-2">
      <span className="text-muted-foreground shrink-0">{label}</span>
      {isEmail
        ? <EmailPopover email={value} />
        : isName
        ? <NamePopover name={value} />
        : <span className={`${bold ? "font-bold text-gray-900 dark:text-white" : "font-medium"} text-right`}>{value}</span>
      }
    </div>
  );
}
