import { z } from "zod";

export const createOrderSchema = z.object({
  customer_name: z.string().min(1, "Customer name is required").max(15, "Name cannot exceed 15 characters"),
  customer_email: z.string().min(1, "Email is required").email("Invalid email address").max(254, "Email is too long"),
  total_amount: z.coerce
    .number({ invalid_type_error: "Amount must be a number" })
    .min(0, "Amount must be 0 or greater"),
});

export type CreateOrderFormValues = z.infer<typeof createOrderSchema>;
