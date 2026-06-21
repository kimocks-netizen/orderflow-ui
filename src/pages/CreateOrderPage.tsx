import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCreateOrder } from "@/features/orders/mutations";
import { createOrderSchema, type CreateOrderFormValues } from "@/features/orders/schemas";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/routes/routes";
import type { Order } from "@/types/order";

export function CreateOrderPage() {
  const navigate = useNavigate();
  const { mutate, isPending } = useCreateOrder();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateOrderFormValues>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: { customer_name: "", customer_email: "", total_amount: 0 },
  });

  const onSubmit = (values: CreateOrderFormValues) => {
    mutate(values, {
      onSuccess: (order: Order) => {
        toast.success("Order created successfully");
        navigate(ROUTES.ORDER_DETAIL(order.id));
      },
      onError: (e: Error) => toast.error(e.message),
    });
  };

  return (
    <div>
      <PageHeader
        title="New Order"
        breadcrumbs={[
          { label: "Orders", href: ROUTES.ORDERS },
          { label: "New Order" },
        ]}
      />

      <Card className="max-w-lg">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="customer_name">Customer Name</Label>
              <Input id="customer_name" placeholder="Jane Smith" {...register("customer_name")} />
              {errors.customer_name && (
                <p className="text-xs text-destructive">{errors.customer_name.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="customer_email">Customer Email</Label>
              <Input id="customer_email" type="email" placeholder="jane@example.com" {...register("customer_email")} />
              {errors.customer_email && (
                <p className="text-xs text-destructive">{errors.customer_email.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="total_amount">Total Amount ($)</Label>
              <Input
                id="total_amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                {...register("total_amount")}
              />
              {errors.total_amount && (
                <p className="text-xs text-destructive">{errors.total_amount.message}</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating…" : "Create Order"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(ROUTES.ORDERS)}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
