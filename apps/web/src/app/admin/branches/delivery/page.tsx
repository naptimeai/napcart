import Link from "next/link";
import {
  Eye,
  Filter,
  Package,
  Pencil,
  Plus,
  Store,
  Truck,
  Wallet,
  Clock,
  Target,
  MapPin,
} from "lucide-react";
import { createOrUpdateBranch } from "@/app/admin/actions";
import {
  AdminWorkspace,
  BranchIcon,
  FormSelect,
  PageTitle,
  Panel,
  PanelHeader,
  PrimaryButton,
  SearchBox,
  SettingToggleRow,
  StatCard,
  StatusBadge,
  ToggleVisual,
  formatAdminMoney,
} from "@/components/admin/phase45-ui";
import { PageNotice } from "@/components/admin/primitives";
import { requireAdminSession } from "@/lib/auth/admin-session";
import {
  getCatalogManagementData,
  getDeliveryZoneManagementData,
} from "@/server/repositories/restaurant-admin";

export default async function DeliveryOverviewPage({
  searchParams,
}: {
  searchParams?: Promise<{
    branch?: string;
    q?: string;
    status?: string;
    notice?: string;
    error?: string;
    panelTab?: string;
  }>;
}) {
  const session = await requireAdminSession();
  const params = searchParams ? await searchParams : undefined;
  const [data, catalog] = await Promise.all([
    getDeliveryZoneManagementData(session.restaurantId),
    getCatalogManagementData(session.restaurantId),
  ]);
  const query = params?.q?.toLowerCase() ?? "";
  const status = params?.status ?? "";
  const branches = data.branches.filter((branch) => {
    const deliveryStatus = resolveDeliveryStatus(branch);
    return (
      (!query ||
        branch.name.toLowerCase().includes(query) ||
        branch.addressText.toLowerCase().includes(query) ||
        branch.deliveryZones.some((zone) => zone.name.toLowerCase().includes(query))) &&
      (!status || deliveryStatus === status)
    );
  });
  const selectedBranch =
    data.branches.find((branch) => branch.id === params?.branch) ??
    branches[0] ??
    data.branches[0];
  const panelTab =
    params?.panelTab === "zones" || params?.panelTab === "fees"
      ? params.panelTab
      : "overview";
  const allZones = data.branches.flatMap((branch) => branch.deliveryZones);
  const avgFee =
    allZones.reduce((total, zone) => total + Number(zone.fee), 0) /
    Math.max(allZones.length, 1);
  const openBranches = data.branches.filter(
    (branch) => resolveDeliveryStatus(branch) === "open",
  ).length;

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
            <PrimaryButton href="/admin/branches/delivery/zones">
              <Plus className="size-5" />
              Add delivery zone
            </PrimaryButton>
          }
          description="Manage branch delivery coverage, fees, and availability."
          title="Delivery"
        />

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Store}
            label="Active branches"
            note={`of ${data.branches.length} total branches`}
            value={data.branches.filter((branch) => branch.isActive).length}
          />
          <StatCard
            icon={Clock}
            label="Open now"
            note="branches open"
            value={openBranches}
          />
          <StatCard
            icon={Target}
            label="Delivery zones"
            note="across all branches"
            value={allZones.length}
          />
          <StatCard
            icon={Wallet}
            label="Avg. fee"
            note="across all zones"
            value={formatAdminMoney(avgFee, data.restaurant.defaultCurrency)}
          />
        </div>

        <form className="grid gap-4 xl:grid-cols-[minmax(280px,360px)_180px_180px_50px_1fr]">
          <SearchBox
            defaultValue={params?.q}
            placeholder="Search branches or zones..."
          />
          <FormSelect defaultValue={status} name="status">
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="paused">Paused</option>
            <option value="closed">Closed</option>
          </FormSelect>
          <FormSelect defaultValue={params?.branch ?? ""} name="branch">
            <option value="">All branches</option>
            {data.branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </FormSelect>
          <button className="flex size-12 items-center justify-center rounded-[10px] border border-[#deded8] bg-white text-[#111]">
            <Filter className="size-5 text-[#111]" />
          </button>
        </form>

        <div className="grid gap-6 xl:grid-cols-[1fr_385px]">
          <Panel className="min-h-[650px] p-6">
            <PanelHeader
              description="View and manage delivery settings for all branches."
              title="Branch delivery coverage"
            />
            <div className="mt-7 grid grid-cols-[1.4fr_0.8fr_1fr_0.5fr_0.8fr_50px] px-3 text-sm font-semibold text-[#555]">
              <span>Branch</span>
              <span>Delivery status</span>
              <span>Hours</span>
              <span>Zones</span>
              <span>Base fee</span>
              <span>Actions</span>
            </div>
            <div className="mt-4 space-y-3">
              {branches.map((branch) => {
                const isSelected = branch.id === selectedBranch?.id;
                const firstZone = branch.deliveryZones[0];
                const deliveryStatus = resolveDeliveryStatus(branch);
                const firstOpenDay = branch.operatingHours.find(
                  (hour) => !hour.isClosed,
                );

                return (
                  <Link
                    className={
                      isSelected
                        ? "grid min-h-[82px] grid-cols-[1.4fr_0.8fr_1fr_0.5fr_0.8fr_50px] items-center rounded-[12px] border-2 border-[#111] px-3"
                        : "grid min-h-[82px] grid-cols-[1.4fr_0.8fr_1fr_0.5fr_0.8fr_50px] items-center border-b border-[#eeeeea] px-3"
                    }
                    href={`/admin/branches/delivery?branch=${branch.id}`}
                    key={branch.id}
                  >
                    <span className="flex items-center gap-4">
                      <BranchIcon className="size-11" tone={isSelected ? "green" : "gray"} />
                      <span>
                        <span className="block font-semibold text-[#111]">
                          {branch.name}
                        </span>
                        <span className="mt-1 block text-sm text-[#777]">
                          {branch.addressText}
                        </span>
                      </span>
                    </span>
                    <DeliveryStatusBadge status={deliveryStatus} />
                    <span>
                      <span className="block text-sm text-[#111]">
                        {branch.isTemporarilyClosed || !firstOpenDay
                          ? "-"
                          : `${firstOpenDay.openTime} - ${firstOpenDay.closeTime}`}
                      </span>
                      <span className="mt-1 block text-xs text-[#777]">
                        {branch.isTemporarilyClosed || !firstOpenDay
                          ? "Closed"
                          : "Every day"}
                      </span>
                    </span>
                    <span className="font-medium text-[#111]">
                      {branch.deliveryZones.length}
                    </span>
                    <span className="font-medium text-[#111]">
                      {firstZone
                        ? formatAdminMoney(
                            firstZone.fee,
                            data.restaurant.defaultCurrency,
                          )
                        : "-"}
                    </span>
                    <span className="flex size-10 items-center justify-center rounded-[10px] border border-[#deded8] bg-white text-[#111]">
                      <Pencil className="size-4 text-[#111]" />
                    </span>
                  </Link>
                );
              })}
            </div>
            <p className="mt-10 text-sm text-[#777]">
              Showing {branches.length} branches
            </p>
          </Panel>

          <DeliveryBranchPanel
            activeTab={panelTab}
            branch={selectedBranch}
            products={catalog.products}
          />
        </div>
      </div>
    </AdminWorkspace>
  );
}

function DeliveryBranchPanel({
  activeTab,
  branch,
  products,
}: {
  activeTab: "overview" | "zones" | "fees";
  branch: Awaited<ReturnType<typeof getDeliveryZoneManagementData>>["branches"][number] | undefined;
  products: Awaited<ReturnType<typeof getCatalogManagementData>>["products"];
}) {
  if (!branch) {
    return <Panel className="p-6">No branch selected.</Panel>;
  }

  const availableProducts = products.filter((product) => {
    const availability = product.branchAvailability.find(
      (item) => item.branchId === branch.id,
    );
    return availability?.isAvailable ?? product.isAvailable;
  });
  const deliveryStatus = resolveDeliveryStatus(branch);

  return (
    <Panel className="p-6 text-[#111]">
      <div className="flex gap-4">
        <BranchIcon className="size-16" tone="green" />
        <div>
          <h2 className="text-xl font-semibold text-[#111]">{branch.name}</h2>
          <p className="mt-1 text-sm text-[#777]">{branch.addressText}</p>
          <div className="mt-3 flex gap-2">
            <StatusBadge tone={branch.isAcceptingOrders ? "green" : "gray"}>
              {branch.isAcceptingOrders ? "Accepting orders" : "Paused"}
            </StatusBadge>
            <StatusBadge tone={deliveryStatus === "open" ? "green" : "gray"}>
              {deliveryStatus === "open"
                ? "Open"
                : deliveryStatus === "closed"
                  ? "Closed"
                  : "Paused"}
            </StatusBadge>
          </div>
        </div>
      </div>
      <div className="mt-8 flex gap-8 border-b border-[#e7e7e3]">
        {[
          ["overview", "Overview"],
          ["zones", "Zones"],
          ["fees", "Fees"],
        ].map(([key, label]) => (
          <Link
            className={
              activeTab === key
                ? "border-b-2 border-[#111] pb-3 text-sm font-semibold !text-[#111]"
                : "pb-3 text-sm font-semibold !text-[#666] transition hover:!text-[#111]"
            }
            href={`/admin/branches/delivery?branch=${branch.id}&panelTab=${key}`}
            key={key}
          >
            {label}
          </Link>
        ))}
      </div>
      {activeTab === "overview" ? (
        <DeliveryOverviewPanelContent
          availableProducts={availableProducts.length}
          branch={branch}
          totalProducts={products.length}
        />
      ) : null}
      {activeTab === "zones" ? <DeliveryZonesPanelContent branch={branch} /> : null}
      {activeTab === "fees" ? <DeliveryFeesPanelContent branch={branch} /> : null}
    </Panel>
  );
}

function BranchDeliveryHiddenInputs({
  branch,
  redirectTo,
}: {
  branch: Awaited<ReturnType<typeof getDeliveryZoneManagementData>>["branches"][number];
  redirectTo: string;
}) {
  return (
    <>
      <input name="branchId" type="hidden" value={branch.id} />
      <input name="redirectTo" type="hidden" value={redirectTo} />
      <input name="name" type="hidden" value={branch.name} />
      <input name="slug" type="hidden" value={branch.slug} />
      <input name="phone" type="hidden" value={branch.phone ?? ""} />
      <input name="addressText" type="hidden" value={branch.addressText} />
      <input name="displayOrder" type="hidden" value={branch.displayOrder} />
      {branch.isTemporarilyClosed ? (
        <input name="isTemporarilyClosed" type="hidden" value="on" />
      ) : null}
    </>
  );
}

function DeliveryOverviewPanelContent({
  availableProducts,
  branch,
  totalProducts,
}: {
  availableProducts: number;
  branch: Awaited<ReturnType<typeof getDeliveryZoneManagementData>>["branches"][number];
  totalProducts: number;
}) {
  return (
    <form action={createOrUpdateBranch} className="mt-7 space-y-6">
      <BranchDeliveryHiddenInputs
        branch={branch}
        redirectTo={`/admin/branches/delivery?branch=${branch.id}&panelTab=overview`}
      />
      <section>
        <h3 className="font-semibold text-[#111]">Address</h3>
        <div className="mt-4 flex gap-4">
          <MapPin className="mt-1 size-5 text-[#777]" />
          <p className="text-sm leading-6 text-[#111]">{branch.addressText}</p>
        </div>
      </section>
      <SettingToggleRow
        defaultChecked={branch.isAcceptingOrders}
        description="Allow this branch to accept orders."
        name="isAcceptingOrders"
        title="Delivery availability"
      />
      <section>
        <h3 className="font-semibold text-[#111]">Fulfillment</h3>
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-4 rounded-[12px] border border-[#e5e5e1] bg-white p-4">
            <span className="flex size-10 items-center justify-center rounded-[10px] bg-[#f1f1ef]">
              <Truck className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#111]">Delivery</p>
              <p className="mt-1 text-xs leading-5 text-[#777]">
                Customers can order for delivery.
              </p>
            </div>
            <ToggleVisual checked={branch.isAcceptingOrders} />
          </div>
          <div className="flex items-center gap-4 rounded-[12px] border border-[#e5e5e1] bg-white p-4">
            <span className="flex size-10 items-center justify-center rounded-[10px] bg-[#f1f1ef]">
              <Package className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#111]">Pickup</p>
              <p className="mt-1 text-xs leading-5 text-[#777]">
                Pickup follows this branch&apos;s open or closed state.
              </p>
            </div>
            <ToggleVisual checked={!branch.isTemporarilyClosed} />
          </div>
        </div>
      </section>
      <SettingToggleRow
        defaultChecked={branch.isActive}
        description="This branch is visible to customers."
        icon={Eye}
        name="isActive"
        title="Visible in checkout"
      />
      <section>
        <h3 className="font-semibold text-[#111]">Available products</h3>
        <p className="mt-1 text-sm text-[#777]">
          Number of products currently available.
        </p>
        <div className="mt-4 rounded-[12px] border border-[#deded8] p-4">
          <p className="text-2xl font-semibold text-[#111]">{availableProducts}</p>
          <p className="text-sm text-[#777]">of {totalProducts} total products</p>
        </div>
      </section>
      <div className="grid gap-3">
        <PrimaryButton className="w-full" type="submit">
          Save delivery settings
        </PrimaryButton>
        <PrimaryButton
          className="w-full"
          href={`/admin/branches/delivery/zones?branch=${branch.id}`}
        >
          Manage zones
        </PrimaryButton>
      </div>
    </form>
  );
}

function DeliveryZonesPanelContent({
  branch,
}: {
  branch: Awaited<ReturnType<typeof getDeliveryZoneManagementData>>["branches"][number];
}) {
  return (
    <div className="mt-7 space-y-5">
      <div>
        <h3 className="font-semibold text-[#111]">Delivery zones</h3>
        <p className="mt-1 text-sm leading-6 text-[#777]">
          Radius zones configured for this branch.
        </p>
      </div>
      <div className="space-y-3">
        {branch.deliveryZones.length ? (
          branch.deliveryZones.map((zone) => (
            <div
              className="flex items-center justify-between gap-4 rounded-[12px] border border-[#deded8] p-4"
              key={zone.id}
            >
              <div>
                <p className="text-sm font-semibold text-[#111]">{zone.name}</p>
                <p className="mt-1 text-xs text-[#777]">
                  Up to {Number(zone.maxDistanceKm).toLocaleString("en-PK")} km
                </p>
              </div>
              <StatusBadge dot tone={zone.isActive ? "green" : "gray"}>
                {zone.isActive ? "Active" : "Inactive"}
              </StatusBadge>
            </div>
          ))
        ) : (
          <p className="rounded-[12px] border border-dashed border-[#deded8] p-4 text-sm text-[#777]">
            No delivery zones are configured for this branch yet.
          </p>
        )}
      </div>
      <PrimaryButton
        className="w-full"
        href={`/admin/branches/delivery/zones?branch=${branch.id}`}
      >
        Manage zones
      </PrimaryButton>
    </div>
  );
}

function DeliveryFeesPanelContent({
  branch,
}: {
  branch: Awaited<ReturnType<typeof getDeliveryZoneManagementData>>["branches"][number];
}) {
  return (
    <div className="mt-7 space-y-5">
      <div>
        <h3 className="font-semibold text-[#111]">Fees</h3>
        <p className="mt-1 text-sm leading-6 text-[#777]">
          Checkout fees and minimum order rules by delivery radius.
        </p>
      </div>
      <div className="overflow-hidden rounded-[12px] border border-[#deded8]">
        {branch.deliveryZones.length ? (
          branch.deliveryZones.map((zone) => (
            <div
              className="grid grid-cols-[1fr_auto] gap-4 border-b border-[#eeeeea] p-4 last:border-b-0"
              key={zone.id}
            >
              <div>
                <p className="text-sm font-semibold text-[#111]">{zone.name}</p>
                <p className="mt-1 text-xs text-[#777]">
                  Minimum order{" "}
                  {zone.minimumOrderAmount
                    ? formatAdminMoney(zone.minimumOrderAmount)
                    : "not required"}
                </p>
              </div>
              <p className="text-sm font-semibold text-[#111]">
                {formatAdminMoney(zone.fee)}
              </p>
            </div>
          ))
        ) : (
          <p className="p-4 text-sm text-[#777]">No fees configured yet.</p>
        )}
      </div>
      <PrimaryButton
        className="w-full"
        href={`/admin/branches/delivery/zones?branch=${branch.id}`}
      >
        Manage zones
      </PrimaryButton>
    </div>
  );
}

function resolveDeliveryStatus(
  branch: Awaited<ReturnType<typeof getDeliveryZoneManagementData>>["branches"][number],
) {
  if (branch.isTemporarilyClosed) {
    return "closed";
  }

  return branch.isAcceptingOrders ? "open" : "paused";
}

function DeliveryStatusBadge({ status }: { status: string }) {
  if (status === "open") {
    return (
      <span className="justify-self-start">
        <StatusBadge dot tone="green">
          Open
        </StatusBadge>
      </span>
    );
  }

  return (
    <span className="justify-self-start">
      <StatusBadge dot tone="gray">
        {status === "closed" ? "Closed" : "Paused"}
      </StatusBadge>
    </span>
  );
}
