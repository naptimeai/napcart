import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Filter,
  MessageCircleMore,
  PackageCheck,
  ReceiptText,
  Search,
  ShoppingBag,
  XCircle,
} from "lucide-react";
import { FulfillmentType, OrderStatus } from "@prisma/client";
import {
  AdminWorkspace,
  FormInput,
  FormSelect,
  PageTitle,
  Panel,
  PrimaryButton,
  StatCard,
  StatusBadge,
  formatAdminMoney,
} from "@/components/admin/phase45-ui";
import { PageNotice } from "@/components/admin/primitives";
import { requireAdminSession } from "@/lib/auth/admin-session";
import {
  getAdminOrdersData,
  type AdminOrdersFilters,
} from "@/server/repositories/restaurant-admin";

type OrdersPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
    branch?: string;
    fulfillment?: string;
    page?: string;
    pageSize?: string;
    notice?: string;
    error?: string;
  }>;
};

const ORDER_STATUSES = Object.values(OrderStatus);
const FULFILLMENT_TYPES = Object.values(FulfillmentType);

function parseOrderStatus(value?: string): OrderStatus | "all" {
  return value && ORDER_STATUSES.includes(value as OrderStatus)
    ? (value as OrderStatus)
    : "all";
}

function parseFulfillmentType(value?: string): FulfillmentType | "all" {
  return value && FULFILLMENT_TYPES.includes(value as FulfillmentType)
    ? (value as FulfillmentType)
    : "all";
}

function parsePage(value?: string) {
  const page = Number(value);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

function parsePageSize(value?: string) {
  const pageSize = Number(value);
  return [10, 20, 50].includes(pageSize) ? pageSize : 20;
}

function formatStatus(status: OrderStatus) {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function statusTone(status: OrderStatus): "green" | "yellow" | "red" | "gray" {
  if (status === OrderStatus.CONFIRMED) {
    return "green";
  }

  if (status === OrderStatus.PENDING_CONFIRMATION) {
    return "yellow";
  }

  if (status === OrderStatus.CANCELLED) {
    return "red";
  }

  return "gray";
}

function formatFulfillment(type: FulfillmentType) {
  return type === FulfillmentType.DELIVERY ? "Delivery" : "Pickup";
}

function formatPaymentMethod(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Karachi",
  }).format(date);
}

function formatCompactMoney(value: unknown, currency = "PKR") {
  const amount = Number(value ?? 0);
  const prefix = currency === "PKR" ? "Rs" : currency;
  const absoluteAmount = Math.abs(amount);

  if (absoluteAmount >= 1_000_000_000) {
    return `${prefix} ${(amount / 1_000_000_000).toFixed(1).replace(/\\.0$/, "")}B`;
  }

  if (absoluteAmount >= 1_000_000) {
    return `${prefix} ${(amount / 1_000_000).toFixed(1).replace(/\\.0$/, "")}M`;
  }

  if (absoluteAmount >= 100_000) {
    return `${prefix} ${(amount / 1_000).toFixed(0)}K`;
  }

  return formatAdminMoney(amount, currency);
}

function buildOrdersHref(
  filters: AdminOrdersFilters,
  overrides: Partial<AdminOrdersFilters>,
) {
  const next = { ...filters, ...overrides };
  const params = new URLSearchParams();

  if (next.q?.trim()) {
    params.set("q", next.q.trim());
  }

  if (next.status && next.status !== "all") {
    params.set("status", next.status);
  }

  if (next.branchId) {
    params.set("branch", next.branchId);
  }

  if (next.fulfillmentType && next.fulfillmentType !== "all") {
    params.set("fulfillment", next.fulfillmentType);
  }

  if (next.page && next.page > 1) {
    params.set("page", String(next.page));
  }

  if (next.pageSize && next.pageSize !== 20) {
    params.set("pageSize", String(next.pageSize));
  }

  const query = params.toString();
  return query ? `/admin/orders?${query}` : "/admin/orders";
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const session = await requireAdminSession();
  const params = searchParams ? await searchParams : undefined;
  const filters: AdminOrdersFilters = {
    q: params?.q,
    status: parseOrderStatus(params?.status),
    branchId: params?.branch,
    fulfillmentType: parseFulfillmentType(params?.fulfillment),
    page: parsePage(params?.page),
    pageSize: parsePageSize(params?.pageSize),
  };
  const data = await getAdminOrdersData(session.restaurantId, filters);
  const hasFilters = Boolean(
    filters.q?.trim() ||
    (filters.status && filters.status !== "all") ||
    filters.branchId ||
    (filters.fulfillmentType && filters.fulfillmentType !== "all"),
  );

  return (
    <AdminWorkspace>
      <div className="space-y-6">
        {typeof params?.notice === "string" ? (
          <PageNotice message={params.notice} />
        ) : null}
        {typeof params?.error === "string" ? (
          <PageNotice message={params.error} tone="error" />
        ) : null}

        <PageTitle
          action={
            <StatusBadge
              tone={
                data.metrics.pendingConfirmationOrdersCount ? "yellow" : "green"
              }
            >
              <MessageCircleMore className="size-3.5" />
              {data.metrics.pendingConfirmationOrdersCount
                ? `${data.metrics.pendingConfirmationOrdersCount} need staff action`
                : "No pending staff actions"}
            </StatusBadge>
          }
          description="Review orders, customers, branches, and WhatsApp activity."
          title="Orders"
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard
            icon={ReceiptText}
            label="Total orders"
            note="All stored orders"
            value={data.metrics.totalOrdersCount.toLocaleString()}
          />
          <StatCard
            icon={Clock3}
            label="Pending"
            note="Needs staff action"
            value={data.metrics.pendingConfirmationOrdersCount.toLocaleString()}
          />
          <StatCard
            icon={CheckCircle2}
            label="Confirmed"
            note="Accepted orders"
            value={data.metrics.confirmedOrdersCount.toLocaleString()}
          />
          <StatCard
            icon={XCircle}
            label="Cancelled"
            note="Stopped orders"
            value={data.metrics.cancelledOrdersCount.toLocaleString()}
          />
          <StatCard
            icon={PackageCheck}
            label="Confirmed sales"
            note="Confirmed revenue"
            value={formatCompactMoney(
              data.metrics.confirmedRevenue,
              data.restaurant.defaultCurrency,
            )}
          />
        </div>

        <Panel className="p-6">
          <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0 xl:max-w-[260px] 2xl:max-w-md">
              <h2 className="text-2xl font-semibold tracking-normal text-[#111]">
                Order register
              </h2>
              <p className="mt-1 text-sm leading-6 text-[#777]">
                Search orders by number, customer, phone, or branch. Results are
                scoped to {data.restaurant.name}.
              </p>
            </div>
            <form className="ml-auto grid min-w-0 gap-3 sm:grid-cols-2 xl:max-w-[780px] xl:flex-1 xl:grid-cols-[minmax(210px,1fr)_minmax(140px,0.65fr)_minmax(150px,0.75fr)] 2xl:max-w-none 2xl:grid-cols-[minmax(280px,1.4fr)_170px_180px_150px_auto]">
              <div className="relative sm:col-span-2 xl:col-span-1">
                <FormInput
                  className="pl-10"
                  defaultValue={filters.q ?? ""}
                  name="q"
                  placeholder="Search orders..."
                />
                <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#777]" />
              </div>
              <FormSelect defaultValue={filters.status ?? "all"} name="status">
                <option value="all">All statuses</option>
                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {formatStatus(status)}
                  </option>
                ))}
              </FormSelect>
              <FormSelect defaultValue={filters.branchId ?? ""} name="branch">
                <option value="">All branches</option>
                {data.branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </FormSelect>
              <FormSelect
                defaultValue={filters.fulfillmentType ?? "all"}
                name="fulfillment"
              >
                <option value="all">All types</option>
                {FULFILLMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {formatFulfillment(type)}
                  </option>
                ))}
              </FormSelect>
              <input name="pageSize" type="hidden" value={filters.pageSize} />
              <div className="flex min-w-0 gap-3 sm:col-span-2 xl:col-span-1 xl:justify-end">
                <PrimaryButton className="min-w-[112px] flex-1 xl:flex-none" type="submit">
                  <Filter className="size-4" />
                  Apply
                </PrimaryButton>
                {hasFilters ? (
                  <Link
                    className="inline-flex h-12 min-w-[104px] flex-1 items-center justify-center rounded-[10px] border border-[#deded8] bg-white px-5 text-sm font-semibold text-[#111] transition hover:bg-[#f6f6f3] xl:flex-none"
                    href="/admin/orders"
                  >
                    Clear
                  </Link>
                ) : null}
              </div>
            </form>
          </div>

          <div className="mt-6 overflow-hidden rounded-[16px] border border-[#e5e5e1]">
            {data.orders.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1040px] text-left text-sm">
                  <thead className="border-b border-[#e7e7e3] bg-[#fafaf8] text-xs font-semibold tracking-[0.08em] text-[#777] uppercase">
                    <tr>
                      <th className="px-5 py-4">Order</th>
                      <th className="px-5 py-4">Customer</th>
                      <th className="px-5 py-4">Branch</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Total</th>
                      <th className="px-5 py-4">WhatsApp</th>
                      <th className="px-5 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ededeb]">
                    {data.orders.map((order) => {
                      const latestLog = order.whatsappMessageLogs[0];

                      return (
                        <tr className="align-middle" key={order.id}>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <span className="flex size-11 items-center justify-center rounded-[12px] bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]">
                                <ShoppingBag className="size-5" />
                              </span>
                              <div>
                                <Link
                                  className="font-semibold text-[#111] transition hover:underline"
                                  href={`/admin/orders/${encodeURIComponent(
                                    order.orderNumber,
                                  )}`}
                                >
                                  {order.orderNumber}
                                </Link>
                                <p className="mt-1 text-xs text-[#777]">
                                  {formatDateTime(order.placedAt)} ·{" "}
                                  {formatFulfillment(order.fulfillmentType)} ·{" "}
                                  {order._count.items} items
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-semibold text-[#111]">
                              {order.customerNameSnapshot}
                            </p>
                            <p className="mt-1 text-xs text-[#777]">
                              {order.customerPhoneSnapshot}
                            </p>
                          </td>
                          <td className="px-5 py-4 text-[#333]">
                            {order.branchNameSnapshot}
                          </td>
                          <td className="px-5 py-4">
                            <StatusBadge dot tone={statusTone(order.status)}>
                              {formatStatus(order.status)}
                            </StatusBadge>
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-semibold text-[#111]">
                              {formatAdminMoney(
                                order.grandTotal,
                                order.currency,
                              )}
                            </p>
                            <p className="mt-1 text-xs text-[#777]">
                              {formatPaymentMethod(order.paymentMethod)}
                            </p>
                          </td>
                          <td className="px-5 py-4">
                            {latestLog ? (
                              <div>
                                <StatusBadge
                                  tone={
                                    latestLog.status === "FAILED"
                                      ? "red"
                                      : "gray"
                                  }
                                >
                                  {latestLog.status.toLowerCase()}
                                </StatusBadge>
                                <p className="mt-1 text-xs text-[#777]">
                                  {order._count.whatsappMessageLogs} log
                                  {order._count.whatsappMessageLogs === 1
                                    ? ""
                                    : "s"}
                                </p>
                              </div>
                            ) : (
                              <StatusBadge tone="gray">No logs</StatusBadge>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <Link
                              className="inline-flex h-10 items-center justify-center rounded-[10px] border border-[#deded8] bg-white px-4 text-sm font-semibold whitespace-nowrap text-[#111] transition hover:bg-[#f6f6f3]"
                              href={`/admin/orders/${encodeURIComponent(
                                order.orderNumber,
                              )}`}
                            >
                              View detail
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-10 text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]">
                  {hasFilters ? (
                    <Search className="size-6" />
                  ) : (
                    <AlertTriangle className="size-6" />
                  )}
                </span>
                <h3 className="mt-5 text-xl font-semibold text-[#111]">
                  {hasFilters
                    ? "No orders match these filters"
                    : "No orders yet"}
                </h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-[#777]">
                  {hasFilters
                    ? "Try a different customer, phone number, branch, or status."
                    : "When a customer places an order from a storefront, it will appear here with its WhatsApp/provider activity."}
                </p>
                {hasFilters ? (
                  <Link
                    className="mt-5 inline-flex h-11 items-center justify-center rounded-[10px] border border-[#deded8] bg-white px-5 text-sm font-semibold text-[#111] transition hover:bg-[#f6f6f3]"
                    href="/admin/orders"
                  >
                    Clear filters
                  </Link>
                ) : null}
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-col gap-3 text-sm text-[#777] sm:flex-row sm:items-center sm:justify-between">
            <form className="flex items-center gap-3">
              <input name="q" type="hidden" value={filters.q ?? ""} />
              <input name="status" type="hidden" value={filters.status ?? "all"} />
              <input name="branch" type="hidden" value={filters.branchId ?? ""} />
              <input
                name="fulfillment"
                type="hidden"
                value={filters.fulfillmentType ?? "all"}
              />
              <span>Show</span>
              <FormSelect
                className="h-11 w-[86px]"
                defaultValue={String(filters.pageSize)}
                name="pageSize"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </FormSelect>
              <span>
                per page · {data.pagination.startRecord.toLocaleString()}-
                {data.pagination.endRecord.toLocaleString()} of{" "}
                {data.pagination.totalRecords.toLocaleString()} orders
              </span>
              <PrimaryButton className="h-11 px-4" type="submit">
                Apply
              </PrimaryButton>
            </form>
            <div className="flex items-center gap-2">
              <Link
                aria-disabled={data.pagination.page <= 1}
                className={
                  data.pagination.page <= 1
                    ? "pointer-events-none inline-flex h-12 items-center justify-center rounded-[10px] border border-[#deded8] bg-white px-5 text-sm font-semibold text-[#111] opacity-45"
                    : "inline-flex h-12 items-center justify-center rounded-[10px] border border-[#deded8] bg-white px-5 text-sm font-semibold text-[#111] transition hover:bg-[#f6f6f3]"
                }
                href={buildOrdersHref(filters, {
                  page: Math.max(data.pagination.page - 1, 1),
                })}
              >
                Previous
              </Link>
              <span className="rounded-[10px] border border-[#deded8] bg-white px-4 py-3 text-sm font-semibold text-[#111]">
                Page {data.pagination.page} of {data.pagination.totalPages}
              </span>
              <Link
                aria-disabled={
                  data.pagination.page >= data.pagination.totalPages
                }
                className={
                  data.pagination.page >= data.pagination.totalPages
                    ? "pointer-events-none inline-flex h-12 items-center justify-center rounded-[10px] border border-[#deded8] bg-white px-5 text-sm font-semibold text-[#111] opacity-45"
                    : "inline-flex h-12 items-center justify-center rounded-[10px] border border-[#deded8] bg-white px-5 text-sm font-semibold text-[#111] transition hover:bg-[#f6f6f3]"
                }
                href={buildOrdersHref(filters, {
                  page: Math.min(
                    data.pagination.page + 1,
                    data.pagination.totalPages,
                  ),
                })}
              >
                Next
              </Link>
            </div>
          </div>
        </Panel>
      </div>
    </AdminWorkspace>
  );
}
