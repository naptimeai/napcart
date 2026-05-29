import Link from "next/link";
import {
  MetricCard,
  SectionHeader,
  StatusPill,
  Surface,
} from "@/components/admin/primitives";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { DAY_LABELS } from "@/lib/constants/admin";
import { getAdminDashboardData } from "@/server/repositories/restaurant-admin";

function formatCurrency(amount?: number | null) {
  if (amount == null) {
    return "Not set";
  }

  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function AdminDashboardPage() {
  const session = await requireAdminSession();
  const data = await getAdminDashboardData(session.restaurantId);
  const { restaurant, branches, connections, metrics } = data;
  const settings = restaurant.settings;

  const readinessItems = [
    {
      label: "Restaurant identity",
      done: Boolean(restaurant.name && restaurant.supportPhone),
      href: "/admin/settings",
    },
    {
      label: "Branch operations",
      done: branches.length > 0,
      href: "/admin/branches",
    },
    {
      label: "WhatsApp routing",
      done: connections.length > 0,
      href: "/admin/whatsapp",
    },
  ];

  return (
    <div className="space-y-4">
      <Surface className="overflow-hidden p-6 sm:p-7 lg:p-8">
        <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <SectionHeader
              eyebrow="Phase 2 Dashboard"
              title={`Operate ${session.restaurantName} from one calm control room`}
              description="This is the first real NapCart management shell. Owners can monitor readiness, configure settings, and direct branch-level operations while order handling remains WhatsApp-first for staff."
              action={
                <div className="flex gap-3">
                  <Link
                    className="inline-flex rounded-full bg-[#0f1720] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#17262f]"
                    href="/admin/settings"
                  >
                    Configure restaurant
                  </Link>
                  <Link
                    className="inline-flex rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-50"
                    href="/admin/branches"
                  >
                    Manage branches
                  </Link>
                </div>
              }
            />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                accent="lime"
                label="Branches"
                note={`${metrics.acceptingBranchesCount} currently accepting orders`}
                value={metrics.branchesCount}
              />
              <MetricCard
                label="Pending review"
                note="Orders waiting for WhatsApp confirmation"
                value={metrics.pendingConfirmationOrdersCount}
              />
              <MetricCard
                accent="copper"
                label="Confirmed orders"
                note="Orders already accepted by staff"
                value={metrics.confirmedOrdersCount}
              />
              <MetricCard
                label="WhatsApp routes"
                note={`${metrics.activeConnectionsCount} active connection${
                  metrics.activeConnectionsCount === 1 ? "" : "s"
                }`}
                value={connections.length}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-[2rem] bg-[linear-gradient(135deg,#101a20_0%,#172b1b_58%,#244027_100%)] p-6 text-white shadow-[0_24px_80px_rgba(16,26,32,0.22)]">
              <p className="text-xs font-semibold tracking-[0.24em] text-[#d7ff9b]/72 uppercase">
                Fulfillment control
              </p>
              <div className="mt-4 grid gap-3">
                <MiniState
                  label="Delivery"
                  value={settings?.deliveryEnabled ? "Enabled" : "Disabled"}
                />
                <MiniState
                  label="Pickup"
                  value={settings?.pickupEnabled ? "Enabled" : "Disabled"}
                />
                <MiniState
                  label="Minimum order"
                  value={formatCurrency(settings?.minimumOrderAmount?.toNumber())}
                />
                <MiniState
                  label="Global state"
                  value={settings?.isGloballyClosed ? "Closed" : "Open"}
                />
              </div>
            </div>

            <div className="rounded-[2rem] border border-black/5 bg-[#faf6ef] p-6">
              <p className="text-xs font-semibold tracking-[0.24em] text-slate-500 uppercase">
                Build readiness
              </p>
              <div className="mt-4 space-y-3">
                {readinessItems.map((item) => (
                  <Link
                    key={item.label}
                    className="flex items-center justify-between rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 transition hover:border-slate-300"
                    href={item.href}
                  >
                    <span className="text-sm font-semibold text-slate-900">
                      {item.label}
                    </span>
                    <StatusPill tone={item.done ? "good" : "warning"}>
                      {item.done ? "Ready" : "Needs setup"}
                    </StatusPill>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Surface>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Surface className="p-6 sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.24em] text-slate-500 uppercase">
                Branch readiness
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Delivery and pickup operations by location
              </h2>
            </div>
            <Link
              className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-50"
              href="/admin/branches"
            >
              Open branch manager
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {branches.map((branch) => {
              const mondayHours = branch.operatingHours.find(
                (item) => item.dayOfWeek === "MONDAY",
              );

              return (
                <div
                  key={branch.id}
                  className="grid gap-4 rounded-[1.7rem] border border-slate-200 bg-[#fcfbf8] p-5 lg:grid-cols-[1fr_260px]"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-slate-950">
                        {branch.name}
                      </h3>
                      <StatusPill tone={branch.isActive ? "good" : "warning"}>
                        {branch.isActive ? "Active" : "Archived"}
                      </StatusPill>
                      <StatusPill
                        tone={branch.isAcceptingOrders ? "good" : "warning"}
                      >
                        {branch.isAcceptingOrders
                          ? "Accepting orders"
                          : "Paused"}
                      </StatusPill>
                    </div>
                    <p className="text-sm leading-6 text-slate-600">
                      {branch.addressText}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-500">
                      <span className="rounded-full bg-slate-100 px-3 py-1">
                        {branch.phone ?? "No branch phone"}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1">
                        {branch.deliveryZones.length} delivery zone
                        {branch.deliveryZones.length === 1 ? "" : "s"}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1">
                        {branch.whatsappConnections.length} WhatsApp route
                        {branch.whatsappConnections.length === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] bg-white p-4 ring-1 ring-black/5">
                    <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
                      Weekly anchor
                    </p>
                    <p className="mt-3 text-sm font-semibold text-slate-900">
                      {DAY_LABELS.MONDAY}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {mondayHours?.isClosed
                        ? "Closed"
                        : `${mondayHours?.openTime ?? "11:00"} - ${
                            mondayHours?.closeTime ?? "23:00"
                          }`}
                    </p>
                    <div className="mt-5 h-2 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-[linear-gradient(90deg,#93e636_0%,#2d693b_100%)]"
                        style={{
                          width: `${Math.max(
                            18,
                            Math.min(
                              100,
                              (branch.operatingHours.filter((item) => !item.isClosed)
                                .length /
                                branch.operatingHours.length) *
                                100,
                            ),
                          )}%`,
                        }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                      Operating on{" "}
                      {branch.operatingHours.filter((item) => !item.isClosed).length} /{" "}
                      {branch.operatingHours.length} configured days
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Surface>

        <Surface className="p-6 sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.24em] text-slate-500 uppercase">
                WhatsApp routing
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Current message destinations
              </h2>
            </div>
            <Link
              className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-50"
              href="/admin/whatsapp"
            >
              Edit routing
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {connections.length ? (
              connections.map((connection) => (
                <div
                  key={connection.id}
                  className="rounded-[1.6rem] border border-slate-200 bg-[#fbfaf7] p-5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-slate-950">
                      {connection.businessName}
                    </h3>
                    {connection.isDefaultForRestaurant ? (
                      <StatusPill tone="good">Default route</StatusPill>
                    ) : null}
                    <StatusPill tone={connection.isActive ? "good" : "warning"}>
                      {connection.isActive ? "Active" : "Paused"}
                    </StatusPill>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">
                    {connection.displayPhoneNumber}
                  </p>
                  <p className="mt-1 text-xs font-medium tracking-[0.18em] text-slate-400 uppercase">
                    Provider · {connection.provider.replace("_", " ")}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-[1.7rem] border border-dashed border-slate-200 bg-[#fbfaf7] p-6 text-sm leading-7 text-slate-500">
                No WhatsApp routes are configured yet. Add a default restaurant
                route first, then branch-specific numbers where needed.
              </div>
            )}
          </div>
        </Surface>
      </div>
    </div>
  );
}

function MiniState({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-[1.3rem] border border-white/8 bg-white/6 px-4 py-3">
      <span className="text-sm font-medium text-white/68">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}
