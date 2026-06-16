"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  UserRound,
  UsersRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type CustomerRecordRow = {
  id: string;
  shortId: string;
  name: string;
  phone: string;
  normalizedPhone: string;
  customerType: "New" | "Returning";
  totalOrders: number;
  firstOrderAt: string | null;
  lastOrderAt: string | null;
  lastBranch: string;
  lastOrderValue: number;
};

const customerTypeOptions = ["All", "New", "Returning"] as const;
const sortOptions = [
  "Latest order",
  "Most orders",
  "Newest customer",
  "Name A-Z",
] as const;

export function CustomerRecordsTable({
  currency,
  data,
  initialQuery = "",
  pageSize = 10,
}: {
  currency: string;
  data: CustomerRecordRow[];
  initialQuery?: string;
  pageSize?: number;
}) {
  const [query, setQuery] = React.useState(initialQuery);
  const [customerType, setCustomerType] =
    React.useState<(typeof customerTypeOptions)[number]>("All");
  const [sort, setSort] =
    React.useState<(typeof sortOptions)[number]>("Latest order");
  const [page, setPage] = React.useState(0);
  const currencyFormatter = React.useMemo(
    () =>
      new Intl.NumberFormat("en-PK", {
        currency,
        maximumFractionDigits: 0,
        style: "currency",
      }),
    [currency],
  );

  const filtered = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const nextRows = data.filter((row) => {
      const matchesQuery = normalizedQuery
        ? `${row.id} ${row.shortId} ${row.name} ${row.phone} ${row.normalizedPhone}`
            .toLowerCase()
            .includes(normalizedQuery)
        : true;
      const matchesType =
        customerType === "All" ? true : row.customerType === customerType;

      return matchesQuery && matchesType;
    });

    return nextRows.toSorted((a, b) => {
      if (sort === "Name A-Z") {
        return a.name.localeCompare(b.name);
      }
      if (sort === "Most orders") {
        return b.totalOrders - a.totalOrders;
      }
      if (sort === "Newest customer") {
        return (b.firstOrderAt ?? "").localeCompare(a.firstOrderAt ?? "");
      }
      return (b.lastOrderAt ?? "").localeCompare(a.lastOrderAt ?? "");
    });
  }, [customerType, data, query, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const visibleRows = filtered.slice(safePage * pageSize, (safePage + 1) * pageSize);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full lg:w-80">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-9 rounded-[min(var(--radius),12px)] pl-8"
              placeholder="Search name, phone, or customer ID..."
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(0);
              }}
            />
          </div>
          <FilterSelect
            icon={<UsersRound />}
            label="Customer type"
            value={customerType}
            values={customerTypeOptions}
            onChange={(value) => {
              setCustomerType(value);
              setPage(0);
            }}
          />
        </div>
        <FilterSelect
          icon={<ArrowUpDown />}
          label="Sort"
          value={sort}
          values={sortOptions}
          onChange={(value) => {
            setSort(value);
            setPage(0);
          }}
        />
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader className="bg-muted/15">
            <TableRow>
              <TableHead className="h-11 p-3 font-medium">Customer</TableHead>
              <TableHead className="h-11 p-3 font-medium">Orders</TableHead>
              <TableHead className="h-11 p-3 font-medium">Customer Type</TableHead>
              <TableHead className="h-11 p-3 font-medium">Last Order</TableHead>
              <TableHead className="h-11 p-3 font-medium">Last Branch</TableHead>
              <TableHead className="h-11 p-3 font-medium">Last Order Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleRows.length ? (
              visibleRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="p-3 align-middle">
                    <div className="flex items-center gap-2">
                      <span className="flex size-8 items-center justify-center rounded-md border bg-muted">
                        <UserRound className="size-4 text-muted-foreground" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-sm leading-none font-medium">
                          {row.name}
                        </span>
                        <span className="mt-1 block truncate text-xs leading-none text-muted-foreground">
                          {row.phone} · ID {row.shortId}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="p-3 align-middle">
                    <span className="text-sm tabular-nums">
                      {row.totalOrders.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="p-3 align-middle">
                    <Badge
                      className="px-1.5"
                      variant={row.customerType === "New" ? "default" : "outline"}
                    >
                      {row.customerType}
                    </Badge>
                  </TableCell>
                  <TableCell className="p-3 align-middle">
                    {row.lastOrderAt ? (
                      <div className="grid gap-0.5">
                        <span className="text-sm">
                          {format(parseISO(row.lastOrderAt), "do MMMM yyyy")}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          at {format(parseISO(row.lastOrderAt), "h:mm a")}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        No orders yet
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="p-3 align-middle text-sm">
                    {row.lastBranch}
                  </TableCell>
                  <TableCell className="p-3 align-middle text-sm tabular-nums">
                    {currencyFormatter.format(row.lastOrderValue)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="h-24 text-center" colSpan={6}>
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-1">
        <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
          {visibleRows.length} of {filtered.length} row(s) visible.
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <span className="text-sm font-medium">Rows per page</span>
            <Button size="sm" variant="outline">
              {pageSize}
            </Button>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Page {safePage + 1} of {pageCount}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              className="hidden size-8 lg:flex"
              disabled={safePage === 0}
              onClick={() => setPage(0)}
              size="icon"
              variant="outline"
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="size-4" />
            </Button>
            <Button
              className="size-8"
              disabled={safePage === 0}
              onClick={() => setPage(Math.max(0, safePage - 1))}
              size="icon"
              variant="outline"
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              className="size-8"
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage(Math.min(pageCount - 1, safePage + 1))}
              size="icon"
              variant="outline"
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="size-4" />
            </Button>
            <Button
              className="hidden size-8 lg:flex"
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage(pageCount - 1)}
              size="icon"
              variant="outline"
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterSelect<T extends string>({
  icon,
  label,
  value,
  values,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: T;
  values: readonly T[];
  onChange?: (value: T) => void;
}) {
  return (
    <label className="inline-flex h-9 items-center gap-1 rounded-[min(var(--radius),12px)] border border-border bg-background px-2.5 text-[0.8rem] font-medium">
      <span className="[&_svg]:size-3.5">{icon}</span>
      <span className="sr-only">{label}</span>
      <select
        className="bg-transparent outline-none"
        value={value}
        onChange={(event) => onChange?.(event.target.value as T)}
      >
        {values.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </label>
  );
}
