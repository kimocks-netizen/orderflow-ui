import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { useCreateOrder } from "@/features/orders/mutations";
import { createOrderSchema, type CreateOrderFormValues } from "@/features/orders/schemas";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
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

  const [nameLen, setNameLen] = useState(0);
  const [emailLen, setEmailLen] = useState(0);
  const [amountVal, setAmountVal] = useState(0);

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
      <PageHeader title="New Order" showBack />
      <div className="flex flex-col items-center px-4 py-4">
        <div className="w-full max-w-xl space-y-4">

          {/* Info card */}
          <Card className="glass-card border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10 shrink-0">
                  <PlusCircle className="h-7 w-7 text-primary" />
                </div>
                <div className="flex-1 text-center">
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">New Order</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Fill in the details below to create a new order</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Form card */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
            <CardContent className="pt-8 pb-8 px-10">
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-7">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="customer_name">Customer Name</Label>
                    <span className={`text-xs tabular-nums ${nameLen >= 15 ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
                      {15 - nameLen} left
                    </span>
                  </div>
                  <Input
                    id="customer_name"
                    placeholder="Jane Smith"
                    maxLength={15}
                    {...register("customer_name", { onChange: (e) => setNameLen(e.target.value.length) })}
                  />
                  {errors.customer_name && (
                    <p className="text-xs text-destructive">{errors.customer_name.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="customer_email">Customer Email</Label>
                    <span className={`text-xs tabular-nums ${emailLen >= 254 ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
                      {254 - emailLen} left
                    </span>
                  </div>
                  <Input
                    id="customer_email"
                    type="email"
                    placeholder="jane@example.com"
                    maxLength={254}
                    {...register("customer_email", { onChange: (e) => setEmailLen(e.target.value.length) })}
                  />
                  {errors.customer_email && (
                    <p className="text-xs text-destructive">{errors.customer_email.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="total_amount">Total Amount (R)</Label>
                  <Input
                    id="total_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    {...register("total_amount", { onChange: (e) => setAmountVal(parseFloat(e.target.value) || 0) })}
                  />
                  {amountVal > 0 && (
                    <p className="text-xs text-muted-foreground tabular-nums">{formatCurrency(amountVal)}</p>
                  )}
                  {errors.total_amount && (
                    <p className="text-xs text-destructive">{errors.total_amount.message}</p>
                  )}
                </div>

                <div className="flex gap-3 pt-1">
                  <Button type="submit" disabled={isPending} className="flex-1">
                    {isPending ? "Creating…" : "Create Order"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate(ROUTES.ORDERS)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
