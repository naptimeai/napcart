"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import {
  Area,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  CircleCheckIcon,
  CreditCard,
  ShoppingBag,
  UserPlus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  CustomerRecordsTable,
  type CustomerRecordRow,
} from "@/components/admin/customer-records-table";

export type DashboardMetrics = {
  totalRevenue: number;
  totalOrdersCount: number;
  newCustomersCount: number;
  branchesCount: number;
  acceptingBranchesCount: number;
  pendingConfirmationOrdersCount: number;
  confirmedOrdersCount: number;
  activeConnectionsCount: number;
};

export type DashboardChartPoint = {
  date: string;
  newCustomers: number;
  activeAccounts: number;
  returningUsers: number;
};

export type OrderRevenuePoint = {
  date: string;
  totalOrders: number;
  confirmedRevenue: number;
};

export type OrderStatusPoint = {
  key: "confirmed" | "pending" | "cancelled";
  label: string;
  value: number;
  fill: string;
};

const chartConfig = {
  newCustomers: {
    label: "New Customers",
    color: "var(--chart-1)",
  },
  activeAccounts: {
    label: "Active Accounts",
    color: "var(--chart-2)",
  },
  returningUsers: {
    label: "Returning Users",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

const orderRevenueChartConfig = {
  totalOrders: {
    label: "Total Orders",
    color: "var(--chart-2)",
  },
  confirmedRevenue: {
    label: "Confirmed Revenue",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const orderStatusChartConfig = {
  confirmed: {
    label: "Confirmed",
    color: "var(--chart-1)",
  },
  pending: {
    label: "Pending",
    color: "var(--chart-3)",
  },
  cancelled: {
    label: "Cancelled",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

export function MetricCards({
  currency,
  metrics,
}: {
  currency: string;
  metrics: DashboardMetrics;
}) {
  const revenue = new Intl.NumberFormat("en-PK", {
    currency,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(metrics.totalRevenue);
  const averageOrderValue = new Intl.NumberFormat("en-PK", {
    currency,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(
    metrics.confirmedOrdersCount
      ? metrics.totalRevenue / metrics.confirmedOrdersCount
      : 0,
  );

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs xl:grid-cols-4">
      <MetricCard
        accent="green"
        icon="revenue"
        label="Total Revenue"
        value={revenue}
        note="Confirmed order value"
      />
      <MetricCard
        accent="amber"
        icon="orders"
        label="Total Orders"
        value={metrics.totalOrdersCount.toLocaleString()}
        note="Orders placed in this period"
      />
      <MetricCard
        accent="teal"
        icon="average"
        label="Average Order Value"
        value={averageOrderValue}
        note="Confirmed revenue per order"
      />
      <MetricCard
        accent="orange"
        icon="customers"
        label="New Customers"
        value={metrics.newCustomersCount.toLocaleString()}
        note="First customer records created"
      />
    </div>
  );
}

function MetricCard({
  accent,
  icon,
  label,
  note,
  value,
}: {
  accent: "green" | "amber" | "teal" | "orange";
  icon: "revenue" | "orders" | "average" | "customers";
  label: string;
  note: string;
  value: string;
}) {
  const Icon =
    icon === "revenue"
      ? CreditCard
      : icon === "orders"
        ? ShoppingBag
        : icon === "average"
          ? CircleCheckIcon
          : UserPlus;
  const accentClasses = {
    amber: {
      card: "border-t-[#d8a21b] bg-linear-to-br from-[#fff7dd] via-white to-white",
      icon: "border-[#f5df9a] bg-[#fff3cb] text-[#a36a00]",
    },
    green: {
      card: "border-t-[#239b53] bg-linear-to-br from-[#edf9f1] via-white to-white",
      icon: "border-[#bee9cc] bg-[#ddf5e7] text-[#23834b]",
    },
    orange: {
      card: "border-t-[#f97316] bg-linear-to-br from-[#fff1e8] via-white to-white",
      icon: "border-[#ffd0b6] bg-[#ffe8d7] text-[#c95605]",
    },
    teal: {
      card: "border-t-[#3d8b68] bg-linear-to-br from-[#eef8f3] via-white to-white",
      icon: "border-[#c5e6d5] bg-[#e4f5eb] text-[#2f7657]",
    },
  }[accent];

  return (
    <Card className={`overflow-hidden border-t-2 ${accentClasses.card}`}>
      <CardHeader>
        <CardTitle>
          <div className={`flex size-8 items-center justify-center rounded-lg border ${accentClasses.icon}`}>
            <Icon className="size-4" />
          </div>
        </CardTitle>
        <CardDescription>{label}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <div className="font-medium text-3xl leading-none tracking-tight tabular-nums">
          {value}
        </div>
        <p className="text-sm text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  );
}

export function OperationalInsights({
  currency,
  dateRangeLabel,
  orderRevenueData,
  orderStatusData,
  totalOrders,
  totalRevenue,
}: {
  currency: string;
  dateRangeLabel: string;
  orderRevenueData: OrderRevenuePoint[];
  orderStatusData: OrderStatusPoint[];
  totalOrders: number;
  totalRevenue: number;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <OrdersRevenueTrend
        currency={currency}
        dateRangeLabel={dateRangeLabel}
        data={orderRevenueData}
        totalOrders={totalOrders}
        totalRevenue={totalRevenue}
      />
      <OrderStatusBreakdown data={orderStatusData} totalOrders={totalOrders} />
    </div>
  );
}

function OrdersRevenueTrend({
  currency,
  data,
  dateRangeLabel,
  totalOrders,
  totalRevenue,
}: {
  currency: string;
  data: OrderRevenuePoint[];
  dateRangeLabel: string;
  totalOrders: number;
  totalRevenue: number;
}) {
  const formattedRevenue = new Intl.NumberFormat("en-PK", {
    currency,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(totalRevenue);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle className="leading-none">Orders & Revenue Trend</CardTitle>
        <CardDescription>
          Confirmed revenue and order volume for {dateRangeLabel}.
        </CardDescription>
        <CardAction className="grid grid-cols-2 gap-2 text-right">
          <div>
            <p className="text-[0.7rem] text-muted-foreground">Revenue</p>
            <p className="font-medium text-sm tabular-nums">{formattedRevenue}</p>
          </div>
          <div>
            <p className="text-[0.7rem] text-muted-foreground">Orders</p>
            <p className="font-medium text-sm tabular-nums">
              {totalOrders.toLocaleString()}
            </p>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={orderRevenueChartConfig}
          className="aspect-auto h-72 w-full"
        >
          <ComposedChart data={data} margin={{ left: 0, right: 0, top: 8 }}>
            <defs>
              <linearGradient id="fillConfirmedRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-confirmedRevenue)"
                  stopOpacity={0.28}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-confirmedRevenue)"
                  stopOpacity={0.04}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeOpacity={0.45} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={36}
              tickFormatter={(value) =>
                parseISO(value).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <YAxis hide yAxisId="orders" />
            <YAxis hide yAxisId="revenue" />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  className="w-52"
                  indicator="line"
                  labelFormatter={(value) =>
                    typeof value === "string"
                      ? format(parseISO(value), "d MMMM yyyy")
                      : value
                  }
                  formatter={(value, name) => {
                    const label =
                      name === "confirmedRevenue"
                        ? "Confirmed Revenue"
                        : "Total Orders";
                    const formattedValue =
                      name === "confirmedRevenue"
                        ? new Intl.NumberFormat("en-PK", {
                            currency,
                            maximumFractionDigits: 0,
                            style: "currency",
                          }).format(Number(value))
                        : Number(value).toLocaleString();

                    return (
                      <>
                        <span className="text-muted-foreground">{label}</span>
                        <span className="ml-auto font-mono font-medium tabular-nums">
                          {formattedValue}
                        </span>
                      </>
                    );
                  }}
                />
              }
            />
            <ChartLegend
              verticalAlign="top"
              content={<ChartLegendContent className="mb-4 justify-end" />}
            />
            <Bar
              dataKey="totalOrders"
              yAxisId="orders"
              fill="var(--color-totalOrders)"
              radius={[6, 6, 0, 0]}
              barSize={18}
            />
            <Area
              dataKey="confirmedRevenue"
              yAxisId="revenue"
              type="natural"
              fill="url(#fillConfirmedRevenue)"
              stroke="var(--color-confirmedRevenue)"
              strokeWidth={1.5}
              dot={false}
              fillOpacity={1}
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function OrderStatusBreakdown({
  data,
  totalOrders,
}: {
  data: OrderStatusPoint[];
  totalOrders: number;
}) {
  const chartData = data.filter((item) => item.value > 0);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle className="leading-none">Order Status Breakdown</CardTitle>
        <CardDescription>
          Confirmation health across pending, confirmed, and cancelled orders.
        </CardDescription>
        <CardAction>
          <Badge variant="outline" className="px-2 text-muted-foreground">
            {totalOrders.toLocaleString()} total
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          {totalOrders > 0 ? (
            <ChartContainer
              config={orderStatusChartConfig}
              className="mx-auto aspect-square h-64"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel indicator="dot" />}
                />
                <Pie
                  data={chartData}
                  dataKey="value"
                  innerRadius={58}
                  outerRadius={88}
                  paddingAngle={3}
                  strokeWidth={4}
                  nameKey="label"
                >
                  {chartData.map((item) => (
                    <Cell key={item.key} fill={item.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          ) : (
            <div className="mx-auto flex aspect-square h-64 items-center justify-center rounded-full border border-dashed bg-muted/25">
              <div className="text-center">
                <p className="text-sm font-medium">No orders yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  This period has no status split.
                </p>
              </div>
            </div>
          )}
          <div className="grid content-center gap-3">
            {data.map((item) => {
              const percent = totalOrders
                ? Math.round((item.value / totalOrders) * 100)
                : 0;

              return (
                <div
                  className="rounded-lg border bg-background p-3"
                  key={item.key}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: item.fill }}
                      />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <span className="font-medium text-sm tabular-nums">
                      {item.value.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: item.fill,
                        width: `${percent}%`,
                      }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {percent}% of selected orders
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PerformanceOverview({
  chartData,
  dateRangeLabel,
}: {
  chartData: DashboardChartPoint[];
  dateRangeLabel: string;
}) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle className="leading-none">
          Customer Activity
        </CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            New customers, confirmed customer activity, and returning customers
            for {dateRangeLabel}.
          </span>
          <span className="@[540px]/card:hidden">{dateRangeLabel}</span>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-80 w-full">
          <ComposedChart data={chartData} margin={{ top: 0 }}>
            <defs>
              <linearGradient id="fillNewCustomers" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-newCustomers)"
                  stopOpacity={0.36}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-newCustomers)"
                  stopOpacity={0.04}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeOpacity={0.5} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={48}
              tickFormatter={(value) =>
                parseISO(value).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  className="w-50"
                  indicator="line"
                  labelFormatter={(value) =>
                    typeof value === "string"
                      ? format(parseISO(value), "d MMMM yyyy")
                      : value
                  }
                />
              }
            />
            <ChartLegend
              verticalAlign="top"
              content={<ChartLegendContent className="mb-5 justify-end" />}
            />
            <Area
              dataKey="newCustomers"
              type="natural"
              fill="url(#fillNewCustomers)"
              stroke="var(--color-newCustomers)"
              strokeWidth={1.25}
              dot={false}
              fillOpacity={1}
            />
            <Line
              dataKey="activeAccounts"
              type="natural"
              stroke="var(--color-activeAccounts)"
              strokeWidth={1.4}
              dot={false}
            />
            <Line
              dataKey="returningUsers"
              type="natural"
              stroke="var(--color-returningUsers)"
              strokeWidth={1.2}
              dot={false}
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function SubscriberOverview({
  currency,
  customers,
  dateRangeLabel,
  totalCustomers,
}: {
  currency: string;
  customers: CustomerRecordRow[];
  dateRangeLabel: string;
  totalCustomers: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="leading-none">
          Recent Customers
        </CardTitle>
        <CardDescription>
          {totalCustomers.toLocaleString()} guest customer records created from
          checkout orders in {dateRangeLabel}.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <CustomerRecordsTable currency={currency} data={customers} />
      </CardContent>
    </Card>
  );
}
