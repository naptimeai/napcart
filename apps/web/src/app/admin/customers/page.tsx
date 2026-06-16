import type { ReactNode } from "react";
import { UsersRound, UserPlus, Repeat, CalendarRange } from "lucide-react";
import {
  CustomerRecordsTable,
  type CustomerRecordRow,
} from "@/components/admin/customer-records-table";
import { Surface, SectionHeader } from "@/components/admin/primitives";
import { PageNotice } from "@/components/admin/primitives";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { getCustomerDirectoryData } from "@/server/repositories/restaurant-admin";

function buildCustomerRows(
  data: Awaited<ReturnType<typeof getCustomerDirectoryData>>,
): CustomerRecordRow[] {
  return data.customers.map((customer) => {
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

export default async function CustomersPage({
  searchParams,
}: {
  searchParams?: Promise<{
    q?: string;
    notice?: string;
    error?: string;
  }>;
}) {
  const session = await requireAdminSession();
  const data = await getCustomerDirectoryData(session.restaurantId);
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const initialQuery = resolvedSearchParams?.q ?? "";

  return (
    <div className="space-y-4">
      {resolvedSearchParams?.notice ? (
        <PageNotice message={resolvedSearchParams.notice} />
      ) : null}
      {resolvedSearchParams?.error ? (
        <PageNotice message={resolvedSearchParams.error} tone="error" />
      ) : null}
      <Surface className="p-6 sm:p-7 lg:p-8">
        <SectionHeader
          action={
            <div className="rounded-full border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground">
              {data.metrics.totalCustomersCount.toLocaleString()} records
            </div>
          }
          description="Review all guest checkout customers stored by NapCart, including repeat customers and their most recent order context."
          eyebrow="Customer directory"
          title="Customer records"
        />
      </Surface>

      <div className="grid gap-4 xl:grid-cols-4">
        <SummaryCard
          description="All customer records stored for this restaurant."
          icon={<UsersRound className="size-4" />}
          label="Total customers"
          value={data.metrics.totalCustomersCount.toLocaleString()}
        />
        <SummaryCard
          description="Customers who have placed more than one order."
          icon={<Repeat className="size-4" />}
          label="Returning customers"
          value={data.metrics.returningCustomersCount.toLocaleString()}
        />
        <SummaryCard
          description="New customer records created today."
          icon={<UserPlus className="size-4" />}
          label="New today"
          value={data.metrics.newTodayCount.toLocaleString()}
        />
        <SummaryCard
          description="New customer records created in the last 30 days."
          icon={<CalendarRange className="size-4" />}
          label="New in 30 days"
          value={data.metrics.newLast30DaysCount.toLocaleString()}
        />
      </div>

      <Surface className="p-6 sm:p-7">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            All customers
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Search by name, phone number, or internal customer ID to inspect
            the customer base captured through guest checkout orders.
          </p>
        </div>

        <div className="mt-6">
          <CustomerRecordsTable
            currency={data.restaurant.defaultCurrency}
            data={buildCustomerRows(data)}
            initialQuery={initialQuery}
            key={initialQuery || "all-customers"}
            pageSize={20}
          />
        </div>
      </Surface>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
            {icon}
          </div>
        </CardTitle>
        <CardDescription>{label}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <div className="font-medium text-3xl leading-none tracking-tight tabular-nums">
          {value}
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
