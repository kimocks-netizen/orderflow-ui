import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { useOrdersQuery } from "@/features/orders/queries";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { useDebounce } from "@/hooks/useDebounce";
import { usePagination } from "@/hooks/usePagination";
import { ROUTES } from "@/routes/routes";
import type { Order, OrderStatus } from "@/types/order";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "shipped", label: "Shipped" },
  { value: "cancelled", label: "Cancelled" },
];

export function OrdersPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [status, setStatus] = useState(searchParams.get("status") ?? "all");
  const debouncedSearch = useDebounce(search, 300);
  const { page, pageSize, goToPage, reset } = usePagination();

  useEffect(() => {
    reset();
  }, [debouncedSearch, status, reset]);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (status !== "all") params.status = status;
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, status, setSearchParams]);

  const { data, isLoading, error } = useOrdersQuery({
    page,
    page_size: pageSize,
    search: debouncedSearch || undefined,
    status,
  });

  return (
    <div>
      <PageHeader
        title="Orders"
        actions={
          <Button asChild size="sm">
            <Link to={ROUTES.CREATE_ORDER}>
              <Plus className="h-4 w-4" />
              New order
            </Link>
          </Button>
        }
      />

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={(v: string) => setStatus(v)}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        {isLoading ? (
          <PageLoader />
        ) : error ? (
          <p className="p-6 text-destructive text-sm">{error.message}</p>
        ) : !data?.items.length ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm gap-2">
            <span>No orders found</span>
            {(debouncedSearch || status !== "all") && (
              <button onClick={() => { setSearch(""); setStatus("all"); }} className="text-primary hover:underline text-xs">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((order: Order) => (
                  <TableRow key={order.id} className="cursor-pointer" onClick={() => navigate(ROUTES.ORDER_DETAIL(order.id))}>
                    <TableCell className="font-mono text-xs text-muted-foreground">#{order.id}</TableCell>
                    <TableCell className="font-medium">{order.customer_name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{order.customer_email}</TableCell>
                    <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                    <TableCell><StatusBadge status={order.status as OrderStatus} /></TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {data.total_pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground">
                <span>
                  Page {page} of {data.total_pages} — {data.total.toLocaleString()} orders
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled={page >= data.total_pages} onClick={() => goToPage(page + 1)}>
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
