import { useParams, useNavigate } from "react-router-dom";
import { useOrderQuery, useOrderHistoryQuery } from "@/features/orders/queries";
import { useUpdateOrderStatus } from "@/features/orders/mutations";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/routes/routes";
import { toast } from "sonner";
import type { OrderStatus, StatusHistoryEntry } from "@/types/order";

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid", "cancelled"],
  paid: ["shipped", "cancelled"],
  shipped: [],
  cancelled: [],
};

const transitionLabels: Record<OrderStatus, string> = {
  paid: "Mark as Paid",
  shipped: "Mark as Shipped",
  cancelled: "Cancel Order",
  pending: "Revert to Pending",
};

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading, error } = useOrderQuery(id!);
  const { data: history } = useOrderHistoryQuery(id!);
  const { mutate, isPending } = useUpdateOrderStatus(id!);

  if (isLoading) return <PageLoader />;
  if (error) return <p className="text-destructive text-sm">{error.message}</p>;
  if (!order) return null;

  const nextStatuses = TRANSITIONS[order.status];

  const handleTransition = (status: OrderStatus) => {
    mutate(
      { status },
      {
        onSuccess: () => toast.success(`Order marked as ${status}`),
        onError: (err: Error) => toast.error(err.message),
      }
    );
  };

  return (
    <div>
      <PageHeader
        title={`Order #${order.id}`}
        breadcrumbs={[
          { label: "Orders", href: ROUTES.ORDERS },
          { label: `#${order.id}` },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.ORDERS)}>
            Back
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Row label="Name" value={order.customer_name} />
              <Row label="Email" value={order.customer_email} />
              <Row label="Total Amount" value={`$${order.total_amount.toFixed(2)}`} />
              <Row label="Created" value={new Date(order.created_at).toLocaleString()} />
              <Row label="Updated" value={new Date(order.updated_at).toLocaleString()} />
            </CardContent>
          </Card>

          {history && history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Status History</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="relative border-l border-border ml-2 flex flex-col gap-4">
                  {history.map((entry: StatusHistoryEntry) => (
                    <li key={entry.id} className="ml-4">
                      <div className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full border-2 border-background bg-primary" />
                      <p className="text-xs text-muted-foreground">{new Date(entry.changed_at).toLocaleString()}</p>
                      <p className="text-sm font-medium mt-0.5">
                        {entry.from_status ? (
                          <>
                            <StatusBadge status={entry.from_status} />
                            <span className="mx-2 text-muted-foreground">→</span>
                          </>
                        ) : null}
                        <StatusBadge status={entry.to_status} />
                      </p>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <StatusBadge status={order.status} />

              {nextStatuses.length > 0 && (
                <div className="flex flex-col gap-2 pt-2 border-t">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Update status</p>
                  {nextStatuses.map((s) => (
                    <Button
                      key={s}
                      variant={s === "cancelled" ? "destructive" : "default"}
                      size="sm"
                      disabled={isPending}
                      onClick={() => handleTransition(s)}
                    >
                      {transitionLabels[s]}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
