import { useDashboardQuery } from "@/features/dashboard/queries";
import { PageHeader } from "@/components/shared/PageHeader";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Link } from "react-router-dom";
import { ROUTES } from "@/routes/routes";
import { ShoppingCart, DollarSign, TrendingUp, Clock } from "lucide-react";
import type { OrderStatus } from "@/types/order";

const statusList: OrderStatus[] = ["pending", "paid", "shipped", "cancelled"];

export function DashboardPage() {
  const { data, isLoading, error } = useDashboardQuery();

  if (isLoading) return <PageLoader />;
  if (error) return <p className="text-destructive text-sm">{error.message}</p>;
  if (!data) return null;

  const summaryCards = [
    {
      title: "Total Orders",
      value: data.total_orders.toLocaleString(),
      icon: ShoppingCart,
      description: "All time",
    },
    {
      title: "Total Revenue",
      value: `$${data.total_revenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      description: "All time",
    },
    {
      title: "Orders Today",
      value: data.orders_today.toLocaleString(),
      icon: TrendingUp,
      description: "Last 24 hours",
    },
    {
      title: "Pending",
      value: data.orders_by_status.pending.toLocaleString(),
      icon: Clock,
      description: "Awaiting payment",
    },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Orders by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {statusList.map((status) => (
              <Link
                key={status}
                to={`${ROUTES.ORDERS}?status=${status}`}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-accent transition-colors"
              >
                <StatusBadge status={status} />
                <span className="text-2xl font-bold">{data.orders_by_status[status].toLocaleString()}</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
