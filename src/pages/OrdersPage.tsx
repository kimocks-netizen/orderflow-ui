import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Plus, Search, Eye, X, Mail, Calendar } from "lucide-react";
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
import { formatCurrency, abbreviateCurrency } from "@/lib/utils";
import { usePagination } from "@/hooks/usePagination";
import { ROUTES } from "@/routes/routes";
import type { Order, OrderStatus } from "@/types/order";

function AmountCell({ amount }: { amount: number }) {
  const [open, setOpen] = useState(false);
  const abbreviated = abbreviateCurrency(amount);
  const full = formatCurrency(amount);
  const needsAbbrev = abbreviated !== full;
  return (
    <div className="relative inline-block">
      <span
        className={`tabular-nums font-medium${needsAbbrev ? " cursor-pointer underline decoration-dotted underline-offset-2" : ""}`}
        onMouseEnter={() => needsAbbrev && setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {abbreviated}
      </span>
      {open && (
        <div className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 rounded-lg bg-popover border border-border text-popover-foreground text-xs shadow-xl whitespace-nowrap">
          {full}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-border" />
        </div>
      )}
    </div>
  );
}

function DatePicker({ value, onChange, min, placeholder }: { value: string; onChange: (v: string) => void; min?: string; placeholder: string }) {
  const display = value
    ? value.replace(/-/g, '/')
    : placeholder;
  return (
    <div className="relative flex items-center h-9 rounded-md border border-input bg-background text-sm w-36 overflow-hidden">
      <Calendar className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none z-10 shrink-0" />
      <span className={`absolute left-8 right-1 pointer-events-none z-10 text-sm truncate ${value ? 'text-foreground' : 'text-muted-foreground'}`}>
        {display}
      </span>
      <input
        type="date"
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
    </div>
  );
}

function truncateEmail(email: string): string {
  if (email.length <= 25) return email;
  const atIndex = email.lastIndexOf("@");
  const domain = atIndex !== -1 ? email.slice(atIndex) : "";
  const local = atIndex !== -1 ? email.slice(0, atIndex) : email;
  const budget = 25 - domain.length - 1; // 1 for '…'
  return budget > 0 ? local.slice(0, budget) + "\u2026" + domain : email.slice(0, 24) + "\u2026";
}

function EmailCell({ email, query }: { email: string; query: string }) {
  const [open, setOpen] = useState(false);
  const truncated = truncateEmail(email);
  const needsTruncation = email.length > 25;
  return (
    <div className="relative inline-block">
      <span
        className={`text-sm text-muted-foreground${needsTruncation ? " cursor-pointer underline decoration-dotted underline-offset-2" : ""}`}
        onMouseEnter={() => needsTruncation && setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <Highlight text={truncated} query={query} />
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

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part)
          ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-500/40 text-yellow-900 dark:text-yellow-100 rounded-sm px-0.5">{part}</mark>
          : part
      )}
    </>
  );
}

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
  const [dateFrom, setDateFrom] = useState(searchParams.get("date_from") ?? "");
  const [dateTo, setDateTo] = useState(searchParams.get("date_to") ?? "");
  const debouncedSearch = useDebounce(search, 300);
  const { page, pageSize, goToPage, reset, changePageSize } = usePagination();

  useEffect(() => {
    reset();
  }, [debouncedSearch, status, dateFrom, dateTo]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const params: Record<string, string> = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (status !== "all") params.status = status;
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, status, dateFrom, dateTo, setSearchParams]);

  const { data, isLoading, error } = useOrdersQuery({
    page,
    page_size: pageSize,
    search: debouncedSearch || undefined,
    status,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  });

  return (
    <div>
      <PageHeader
        title="Orders"
        showBack
        actions={
          <Button asChild size="sm">
            <Link to={ROUTES.CREATE_ORDER}>
              <Plus className="h-4 w-4" />
              New order
            </Link>
          </Button>
        }
      />

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="pl-9 pr-8"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
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
        <DatePicker value={dateFrom} onChange={setDateFrom} placeholder="From date" />
        <DatePicker value={dateTo} onChange={setDateTo} min={dateFrom} placeholder="To date" />
        {(dateFrom || dateTo) && (
          <Button variant="ghost" size="sm" onClick={() => { setDateFrom(""); setDateTo(""); }} className="gap-1.5 text-muted-foreground">
            <X className="h-3.5 w-3.5" /> Clear dates
          </Button>
        )}
      </div>

      <Card className="hover:shadow-md transition-shadow duration-200">
        {isLoading ? (
          <PageLoader />
        ) : error ? (
          <p className="p-6 text-destructive text-sm">{error.message}</p>
        ) : !data?.items.length ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm gap-2">
            <span>No orders found</span>
            {(debouncedSearch || status !== "all") && (
              <button onClick={() => { setSearch(""); setStatus("all"); setDateFrom(""); setDateTo(""); }} className="text-primary hover:underline text-xs">
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
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((order: Order) => (
                  <TableRow key={order.id} className="cursor-pointer hover:bg-muted/80 dark:hover:bg-muted/50 hover:scale-[1.01] transition-all duration-150" onClick={() => navigate(ROUTES.ORDER_DETAIL(order.id))}>
                    <TableCell className="font-mono text-xs text-muted-foreground">#{order.id}</TableCell>
                    <TableCell className="font-medium max-w-[9rem]">
                      <span title={order.customer_name.length > 14 ? order.customer_name : undefined} className="block truncate">
                        <Highlight text={order.customer_name.length > 14 ? order.customer_name.slice(0, 14) + '…' : order.customer_name} query={debouncedSearch} />
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      <EmailCell email={order.customer_email} query={debouncedSearch} />
                    </TableCell>
                    <TableCell><AmountCell amount={order.total_amount} /></TableCell>
                    <TableCell><StatusBadge status={order.status as OrderStatus} /></TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" asChild className="gap-1.5 text-muted-foreground hover:text-foreground">
                        <Link to={ROUTES.ORDER_DETAIL(order.id)}>
                          <Eye className="h-4 w-4" />
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

              <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <span>Rows per page:</span>
                  <Select value={String(pageSize)} onValueChange={(v) => changePageSize(Number(v))}>
                    <SelectTrigger className="w-20 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 10, 20, 50].map((n) => (
                        <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-xs">
                    {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, data.total)} of {data.total.toLocaleString()}
                  </span>
                </div>

                {data.total_pages > 1 && (
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={page <= 1} onClick={() => goToPage(1)}>
                      «
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
                      ‹
                    </Button>
                    {Array.from({ length: data.total_pages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === data.total_pages || Math.abs(p - page) <= 1)
                      .reduce<(number | '...')[]>((acc, p, i, arr) => {
                        if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...');
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, i) =>
                        p === '...' ? (
                          <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground">…</span>
                        ) : (
                          <Button
                            key={p}
                            variant={p === page ? 'default' : 'outline'}
                            size="sm"
                            className="h-8 w-8 p-0 text-xs"
                            onClick={() => goToPage(p as number)}
                          >
                            {p}
                          </Button>
                        )
                      )
                    }
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={page >= data.total_pages} onClick={() => goToPage(page + 1)}>
                      ›
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={page >= data.total_pages} onClick={() => goToPage(data.total_pages)}>
                      »
                    </Button>
                  </div>
                )}
              </div>
          </>
        )}
      </Card>
    </div>
  );
}
