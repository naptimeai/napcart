import {
  MetricCards,
  OperationalInsights,
  PerformanceOverview,
  SubscriberOverview,
  type DashboardChartPoint,
  type OrderRevenuePoint,
  type OrderStatusPoint,
} from "@/components/admin/default-dashboard";
import { type CustomerRecordRow } from "@/components/admin/customer-records-table";
import {
  resolveDashboardDateRange,
  toDateKey,
} from "@/lib/admin-dashboard-date-range";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { getAdminDashboardData } from "@/server/repositories/restaurant-admin";
import { PageNotice } from "@/components/admin/primitives";

function formatDateKey(date: Date) {
  return toDateKey(date);
}

function buildChartData(
  data: Awaited<ReturnType<typeof getAdminDashboardData>>,
  dateRange: ReturnType<typeof resolveDashboardDateRange>,
): DashboardChartPoint[] {
  const startDate = new Date(dateRange.fromDate);
  const endDate = new Date(dateRange.toDateExclusive);
  endDate.setDate(endDate.getDate() - 1);
  const dayCount = Math.max(
    1,
    Math.round(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    ) + 1,
  );

  return Array.from({ length: dayCount }).map((_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    const dateKey = formatDateKey(date);
    const dayOrders = data.recentOrders.filter(
      (order) => formatDateKey(order.placedAt) === dateKey,
    );
    const confirmed = dayOrders.filter((order) => order.status === "CONFIRMED");
    const newCustomers = data.recentCustomers.filter(
      (customer) => formatDateKey(customer.createdAt) === dateKey,
    );
    const returning = data.recentCustomers.filter((customer) => {
      if (!customer.lastOrderAt || customer.totalOrdersCount < 2) {
        return false;
      }

      return formatDateKey(customer.lastOrderAt) === dateKey;
    });

    return {
      date: dateKey,
      newCustomers: newCustomers.length,
      activeAccounts: confirmed.length,
      returningUsers: returning.length,
    };
  });
}

function buildOrderRevenueData(
  data: Awaited<ReturnType<typeof getAdminDashboardData>>,
  dateRange: ReturnType<typeof resolveDashboardDateRange>,
): OrderRevenuePoint[] {
  const startDate = new Date(dateRange.fromDate);
  const endDate = new Date(dateRange.toDateExclusive);
  endDate.setDate(endDate.getDate() - 1);
  const dayCount = Math.max(
    1,
    Math.round(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    ) + 1,
  );

  return Array.from({ length: dayCount }).map((_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    const dateKey = formatDateKey(date);
    const dayOrders = data.recentOrders.filter(
      (order) => formatDateKey(order.placedAt) === dateKey,
    );
    const confirmedRevenue = dayOrders
      .filter((order) => order.status === "CONFIRMED")
      .reduce((total, order) => total + Number(order.grandTotal), 0);

    return {
      date: dateKey,
      totalOrders: dayOrders.length,
      confirmedRevenue,
    };
  });
}

function buildOrderStatusData(
  data: Awaited<ReturnType<typeof getAdminDashboardData>>,
): OrderStatusPoint[] {
  return [
    {
      key: "confirmed",
      label: "Confirmed",
      value: data.metrics.confirmedOrdersCount,
      fill: "var(--chart-1)",
    },
    {
      key: "pending",
      label: "Pending",
      value: data.metrics.pendingConfirmationOrdersCount,
      fill: "var(--chart-3)",
    },
    {
      key: "cancelled",
      label: "Cancelled",
      value: data.metrics.cancelledOrdersCount,
      fill: "var(--chart-5)",
    },
  ];
}

function buildCustomerRows(
  data: Awaited<ReturnType<typeof getAdminDashboardData>>,
): CustomerRecordRow[] {
  if (data.recentCustomers.length) {
    return data.recentCustomers.map((customer) => {
      const latestOrder = customer.orders[0];

      return {
        id: customer.id,
        shortId: customer.id.slice(0, 8).toUpperCase(),
        name: customer.name,
        phone: customer.rawPhoneInput,
        normalizedPhone: customer.normalizedPhone,
        customerType: customer.totalOrdersCount > 1 ? "Returning" : "New",
        totalOrders: customer.totalOrdersCount,
        firstOrderAt: customer.firstOrderAt?.toISOString() ?? null,
        lastOrderAt: latestOrder?.placedAt.toISOString() ?? null,
        lastBranch: latestOrder?.branchNameSnapshot ?? "No orders yet",
        lastOrderValue: latestOrder ? Number(latestOrder.grandTotal) : 0,
      };
    });
  }

  return [];
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{
    range?: string | string[];
    from?: string | string[];
    to?: string | string[];
    notice?: string;
    error?: string;
  }>;
}) {
  const session = await requireAdminSession();
  const params = await searchParams;
  const dateRange = resolveDashboardDateRange(params);
  const data = await getAdminDashboardData(session.restaurantId, dateRange);

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      {typeof params?.notice === "string" ? (
        <PageNotice message={params.notice} />
      ) : null}
      {typeof params?.error === "string" ? (
        <PageNotice message={params.error} tone="error" />
      ) : null}
      <MetricCards
        currency={data.restaurant.defaultCurrency}
        metrics={data.metrics}
      />
      <OperationalInsights
        currency={data.restaurant.defaultCurrency}
        dateRangeLabel={dateRange.label}
        orderRevenueData={buildOrderRevenueData(data, dateRange)}
        orderStatusData={buildOrderStatusData(data)}
        totalOrders={data.metrics.totalOrdersCount}
        totalRevenue={data.metrics.totalRevenue}
      />
      <PerformanceOverview
        chartData={buildChartData(data, dateRange)}
        dateRangeLabel={dateRange.label}
      />
      <SubscriberOverview
        currency={data.restaurant.defaultCurrency}
        customers={buildCustomerRows(data)}
        totalCustomers={data.metrics.newCustomersCount}
        dateRangeLabel={dateRange.label}
      />
    </div>
  );
}
