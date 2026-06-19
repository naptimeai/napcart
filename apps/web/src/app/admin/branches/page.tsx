import Link from "next/link";
import { Eye, MapPin, Package, Pencil, Plus, Truck, X } from "lucide-react";
import {
  createOrUpdateBranch,
  updateBranchOperatingHours,
} from "@/app/admin/actions";
import {
  AdminWorkspace,
  BranchIcon,
  FormInput,
  PageTitle,
  Panel,
  PrimaryButton,
  SearchBox,
  SettingToggleRow,
  StatusBadge,
} from "@/components/admin/phase45-ui";
import { PageNotice } from "@/components/admin/primitives";
import { DAY_LABELS } from "@/lib/constants/admin";
import {
  formatOperatingHoursSummary,
  getBranchOperationalStatus,
} from "@/lib/branch-hours";
import { requireAdminSession } from "@/lib/auth/admin-session";
import {
  getBranchManagementData,
  getCatalogManagementData,
} from "@/server/repositories/restaurant-admin";

type BranchPageProps = {
  searchParams?: Promise<{
    branch?: string;
    tab?: string;
    q?: string;
    panel?: string;
    notice?: string;
    error?: string;
  }>;
};

export default async function BranchManagementPage({
  searchParams,
}: BranchPageProps) {
  const session = await requireAdminSession();
  const params = searchParams ? await searchParams : undefined;
  const [branches, catalog] = await Promise.all([
    getBranchManagementData(session.restaurantId),
    getCatalogManagementData(session.restaurantId),
  ]);
  const query = params?.q?.toLowerCase() ?? "";
  const filteredBranches = branches.filter(
    (branch) =>
      branch.name.toLowerCase().includes(query) ||
      branch.addressText.toLowerCase().includes(query) ||
      branch.slug.toLowerCase().includes(query),
  );
  const selectedBranch =
    branches.find((branch) => branch.id === params?.branch) ??
    filteredBranches[0] ??
    branches[0];
  const timezone = catalog.restaurant.timezone;
  const activeTab = params?.tab === "hours" || params?.tab === "catalog"
    ? params.tab
    : "details";
  const inspectorOpen = params?.panel !== "closed";
  const selectedProducts = selectedBranch
    ? catalog.products.filter((product) => {
        const availability = product.branchAvailability.find(
          (item) => item.branchId === selectedBranch.id,
        );
        return availability?.isAvailable ?? product.isAvailable;
      })
    : [];

  return (
    <AdminWorkspace className="p-0">
      <div
        className={
          inspectorOpen
            ? "grid min-h-[calc(100svh-32px)] xl:grid-cols-[1fr_390px]"
            : "grid min-h-[calc(100svh-32px)]"
        }
      >
        <section className="p-6 md:p-8">
          <div className="space-y-7">
            {typeof params?.notice === "string" ? (
              <PageNotice message={params.notice} />
            ) : null}
            {typeof params?.error === "string" ? (
              <PageNotice message={params.error} tone="error" />
            ) : null}

            <PageTitle
              action={
                <PrimaryButton className="min-w-[150px]" href="/admin/branches/settings">
                  <Plus className="size-5" />
                  Add branch
                </PrimaryButton>
              }
              description="Manage your branches, hours, and catalog availability."
              title="Branches"
            />

            <form>
              <div className="flex max-w-[440px] gap-3">
                <SearchBox
                  className="flex-1"
                  defaultValue={params?.q}
                  placeholder="Search branches..."
                />
                <PrimaryButton className="h-12 px-5" type="submit">
                  Apply
                </PrimaryButton>
              </div>
            </form>

            <div className="grid grid-cols-[1.5fr_0.72fr_1fr_0.7fr_48px] px-4 text-sm font-medium text-[#666]">
              <span>Branch</span>
              <span>Status</span>
              <span>Hours</span>
              <span>Available products</span>
              <span />
            </div>

            <div className="space-y-3">
              {filteredBranches.map((branch) => {
                const isSelected = branch.id === selectedBranch?.id;
                const availableProducts = catalog.products.filter((product) => {
                  const availability = product.branchAvailability.find(
                    (item) => item.branchId === branch.id,
                  );
                  return availability?.isAvailable ?? product.isAvailable;
                }).length;
                const hoursSummary = formatOperatingHoursSummary(
                  branch.operatingHours,
                );
                const operationalStatus = getBranchOperationalStatus(
                  branch,
                  timezone,
                );
                const statusLabel = branch.isActive
                  ? operationalStatus === "open"
                    ? "Active"
                    : operationalStatus === "paused"
                      ? "Paused"
                      : "Closed"
                  : "Inactive";

                return (
                  <Link
                    className={
                      isSelected
                        ? "grid min-h-[86px] grid-cols-[1.5fr_0.72fr_1fr_0.7fr_48px] items-center rounded-[12px] border-2 border-[var(--admin-primary)] bg-[var(--admin-primary-softer)] px-4"
                        : "grid min-h-[86px] grid-cols-[1.5fr_0.72fr_1fr_0.7fr_48px] items-center rounded-[12px] border border-[#e2e2dd] px-4 transition hover:border-[var(--admin-primary)] hover:bg-[var(--admin-primary-softer)]"
                    }
                    href={`/admin/branches?branch=${branch.id}`}
                    key={branch.id}
                  >
                    <span className="flex items-center gap-4">
                      <BranchIcon className="size-11" />
                      <span>
                        <span className="block font-semibold text-[#111]">
                          {branch.name}
                        </span>
                        <span className="mt-1 block text-sm text-[#777]">
                          {branch.addressText}
                        </span>
                      </span>
                    </span>
                    <span>
                      <StatusBadge
                        dot
                        tone={branch.isActive && operationalStatus === "open" ? "green" : "gray"}
                      >
                        {statusLabel}
                      </StatusBadge>
                    </span>
                    <span>
                      <span className="block text-sm text-[#111]">
                        {hoursSummary.hours}
                      </span>
                      <span className="mt-1 block text-xs text-[#777]">
                        {hoursSummary.label}
                      </span>
                    </span>
                    <span className="font-medium text-[#111]">
                      {availableProducts}
                    </span>
                    <span className="flex size-10 items-center justify-center rounded-[10px] border border-[#deded8] bg-white text-[#111]">
                      <Pencil className="size-4 text-[#111]" />
                    </span>
                  </Link>
                );
              })}
            </div>

            <p className="text-sm text-[#777]">
              Showing {filteredBranches.length} of {branches.length} branches
            </p>
          </div>
        </section>

        {inspectorOpen ? (
          <BranchInspector
            activeTab={activeTab}
            availableProducts={selectedProducts.length}
            branch={selectedBranch}
            timezone={timezone}
            totalProducts={catalog.products.length}
          />
        ) : null}
      </div>
    </AdminWorkspace>
  );
}

function BranchInspector({
  branch,
  activeTab,
  availableProducts,
  timezone,
  totalProducts,
}: {
  branch: Awaited<ReturnType<typeof getBranchManagementData>>[number] | undefined;
  activeTab: "details" | "hours" | "catalog";
  availableProducts: number;
  timezone: string;
  totalProducts: number;
}) {
  if (!branch) {
    return (
      <aside className="border-l border-[#e5e5e1] p-8">
        <p className="font-semibold text-[#111]">No branch selected</p>
      </aside>
    );
  }

  return (
    <aside className="border-l border-[#e5e5e1] bg-white p-6 text-[#111] md:p-8">
      <div className="flex justify-end">
        <Link
          aria-label="Close branch details"
          className="inline-flex size-9 items-center justify-center rounded-[10px] text-[#111] transition hover:bg-[#f6f6f3]"
          href="/admin/branches?panel=closed"
        >
          <X className="size-5" />
        </Link>
      </div>
      <div className="mt-2 flex gap-4">
        <BranchIcon className="size-16" />
        <div>
          <h2 className="text-xl font-semibold text-[#111]">{branch.name}</h2>
          <p className="mt-1 text-sm text-[#777]">{branch.slug}</p>
          <div className="mt-3">
            <StatusBadge
              dot
              tone={
                branch.isActive &&
                getBranchOperationalStatus(branch, timezone) === "open"
                  ? "green"
                  : "gray"
              }
            >
              {!branch.isActive
                ? "Inactive"
                : getBranchOperationalStatus(branch, timezone) === "open"
                  ? "Active"
                  : getBranchOperationalStatus(branch, timezone) === "paused"
                    ? "Paused"
                    : "Closed"}
            </StatusBadge>
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-8 border-b border-[#e7e7e3]">
        {[
          ["details", "Details"],
          ["hours", "Hours"],
          ["catalog", "Catalog"],
        ].map(([key, label]) => (
          <Link
            className={
              activeTab === key
                ? "border-b-2 border-[var(--admin-primary)] pb-3 text-sm font-semibold !text-[var(--admin-primary)]"
                : "pb-3 text-sm font-semibold !text-[#666] transition hover:!text-[var(--admin-primary)]"
            }
            href={`/admin/branches?branch=${branch.id}&tab=${key}`}
            key={key}
          >
            {label}
          </Link>
        ))}
      </div>

      {activeTab === "details" ? (
        <BranchDetailsTab
          availableProducts={availableProducts}
          branch={branch}
          totalProducts={totalProducts}
        />
      ) : null}
      {activeTab === "hours" ? <BranchHoursTab branch={branch} /> : null}
      {activeTab === "catalog" ? (
        <BranchCatalogTab
          availableProducts={availableProducts}
          totalProducts={totalProducts}
        />
      ) : null}
    </aside>
  );
}

function BranchDetailsTab({
  branch,
  availableProducts,
  totalProducts,
}: {
  branch: Awaited<ReturnType<typeof getBranchManagementData>>[number];
  availableProducts: number;
  totalProducts: number;
}) {
  return (
    <form action={createOrUpdateBranch} className="mt-7 space-y-7">
      <input name="branchId" type="hidden" value={branch.id} />
      <input name="redirectTo" type="hidden" value={`/admin/branches?branch=${branch.id}`} />
      <input name="name" type="hidden" value={branch.name} />
      <input name="slug" type="hidden" value={branch.slug} />
      <input name="displayOrder" type="hidden" value={branch.displayOrder} />
      <input name="phone" type="hidden" value={branch.phone ?? ""} />
      <section>
        <h3 className="font-semibold text-[#111]">Address</h3>
        <div className="mt-4 flex gap-4">
          <MapPin className="mt-1 size-5 text-[#777]" />
          <FormInput name="addressText" defaultValue={branch.addressText} required />
        </div>
      </section>
      <section className="border-t border-[#e7e7e3] pt-7">
        <h3 className="font-semibold text-[#111]">Services</h3>
        <p className="mt-1 text-sm text-[#777]">
          Choose how this branch fulfills orders.
        </p>
        <div className="mt-4 space-y-3">
          <SettingToggleRow
            defaultChecked={branch.isAcceptingOrders}
            description="Controls whether this branch can receive new delivery or pickup orders."
            icon={Truck}
            name="isAcceptingOrders"
            title="Accepting orders"
          />
          <div className="flex items-center gap-4 rounded-[12px] border border-[#e5e5e1] bg-white p-4">
            <span className="flex size-10 items-center justify-center rounded-[10px] bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]">
              <Package className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#111]">Pickup follows branch status</p>
              <p className="mt-1 text-xs leading-5 text-[#777]">
                Pickup is enabled restaurant-wide; branch pause, closure, and hours still apply.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="border-t border-[#e7e7e3] pt-7">
        <h3 className="font-semibold text-[#111]">Temporary closure</h3>
        <p className="mt-1 text-sm text-[#777]">
          Use this when the branch needs to stop receiving orders for a short period.
        </p>
        <div className="mt-4">
          <SettingToggleRow
            defaultChecked={branch.isTemporarilyClosed}
            description="Closed branches are hidden from checkout and cannot receive orders."
            name="isTemporarilyClosed"
            title="Mark branch temporarily closed"
          />
        </div>
      </section>
      <section className="border-t border-[#e7e7e3] pt-7">
        <h3 className="font-semibold text-[#111]">Branch visibility</h3>
        <p className="mt-1 text-sm text-[#777]">
          Active branches can appear in storefront branch selection and checkout.
        </p>
        <div className="mt-4">
          <SettingToggleRow
            defaultChecked={branch.isActive}
            description="Inactive branches are hidden from customers and cannot receive orders."
            icon={Eye}
            name="isActive"
            title="Active in storefront"
          />
        </div>
      </section>
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
      <PrimaryButton className="w-full" type="submit">
        Save changes
      </PrimaryButton>
    </form>
  );
}

function BranchHoursTab({
  branch,
}: {
  branch: Awaited<ReturnType<typeof getBranchManagementData>>[number];
}) {
  return (
    <form action={updateBranchOperatingHours} className="mt-7 space-y-4">
      <input name="branchId" type="hidden" value={branch.id} />
      <input
        name="redirectTo"
        type="hidden"
        value={`/admin/branches?branch=${branch.id}&tab=hours`}
      />
      <div>
        <h3 className="font-semibold text-[#111]">Opening hours</h3>
        <p className="mt-1 text-sm text-[#777]">
          Set this branch&apos;s weekly operating schedule.
        </p>
      </div>
      {branch.operatingHours.map((hour) => (
        <div
          className="rounded-[12px] border border-[#deded8] p-3"
          key={hour.dayOfWeek}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-[#111]">
              {DAY_LABELS[hour.dayOfWeek]}
            </div>
            <label className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-[10px] border border-[#deded8] px-3 text-xs font-semibold text-[#111]">
              <input
                defaultChecked={hour.isClosed}
                name={`${hour.dayOfWeek}_isClosed`}
                type="checkbox"
              />
              Closed
            </label>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <FormInput
              defaultValue={hour.openTime ?? "11:00"}
              name={`${hour.dayOfWeek}_openTime`}
              type="time"
            />
            <FormInput
              defaultValue={hour.closeTime ?? "23:00"}
              name={`${hour.dayOfWeek}_closeTime`}
              type="time"
            />
          </div>
        </div>
      ))}
      <PrimaryButton className="w-full" type="submit">
        Save hours
      </PrimaryButton>
    </form>
  );
}

function BranchCatalogTab({
  availableProducts,
  totalProducts,
}: {
  availableProducts: number;
  totalProducts: number;
}) {
  return (
    <div className="mt-7 space-y-5">
      <div>
        <h3 className="font-semibold text-[#111]">Branch catalog</h3>
        <p className="mt-1 text-sm leading-6 text-[#777]">
          This tab summarizes how many catalog items are available for this
          branch. Product-level controls remain inside Catalog &gt; Products.
        </p>
      </div>
      <Panel className="p-5">
        <div className="flex items-center gap-4">
          <Package className="size-12 rounded-full bg-[var(--admin-primary-soft)] p-3 text-[var(--admin-primary)]" />
          <div>
            <p className="text-3xl font-semibold text-[#111]">
              {availableProducts}
            </p>
            <p className="text-sm text-[#777]">
              of {totalProducts} products available
            </p>
          </div>
        </div>
      </Panel>
      <PrimaryButton className="w-full" href="/admin/catalog/products">
        Manage product availability
      </PrimaryButton>
    </div>
  );
}
