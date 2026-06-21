import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrder, updateOrderStatus } from "./api";
import { ordersKeys } from "./queries";
import type { CreateOrderPayload, UpdateStatusPayload } from "@/types/order";

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrderPayload) => createOrder(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ordersKeys.all });
    },
  });
}

export function useUpdateOrderStatus(id: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateStatusPayload) => updateOrderStatus(id, data),
    onSuccess: (updated) => {
      qc.setQueryData(ordersKeys.detail(id), updated);
      qc.invalidateQueries({ queryKey: ordersKeys.all });
    },
  });
}
