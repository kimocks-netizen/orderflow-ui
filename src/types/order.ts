export type OrderStatus = "pending" | "paid" | "shipped" | "cancelled";

export interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderPayload {
  customer_name: string;
  customer_email: string;
  total_amount: number;
}

export interface UpdateStatusPayload {
  status: OrderStatus;
}

export interface StatusHistoryEntry {
  id: number;
  order_id: number;
  from_status: OrderStatus | null;
  to_status: OrderStatus;
  changed_at: string;
}
