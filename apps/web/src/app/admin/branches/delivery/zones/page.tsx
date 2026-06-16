import {
  BriefcaseBusiness,
  Eye,
  Pencil,
  Plus,
  Target,
  Trash2,
  Truck,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import {
  createOrUpdateBranch,
  createOrUpdateDeliveryZone,
  deleteDeliveryZone,
} from "@/app/admin/actions";
import {
  AdminWorkspace,
  BranchIcon,
  FormField,
  FormInput,
  FormSelect,
  PageTitle,
  Panel,
  PanelHeader,
  PrimaryButton,
  SettingToggleRow,
  StatusBadge,
  formatAdminMoney,
} from "@/components/admin/phase45-ui";
import { PageNotice } from "@/components/admin/primitives";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { getDeliveryZoneManagementData } from "@/server/repositories/restaurant-admin";

export default async function DeliveryZonesEditorPage({
  searchParams,
}: {
  searchParams?: Promise<{
    branch?: string;
    zone?: string;
    notice?: string;
    error?: string;
  }>;
}) {
  const session = await requireAdminSession();
  const params = searchParams ? await searchParams : undefined;
  const data = await getDeliveryZoneManagementData(session.restaurantId);
  const selectedBranch =
    data.branches.find((branch) => branch.id === params?.branch) ??
    data.branches[0];
  const selectedZone =
    selectedBranch?.deliveryZones.find((zone) => zone.id === params?.zone) ??
    selectedBranch?.deliveryZones[0];
  const avgFee = selectedBranch
    ? selectedBranch.deliveryZones.reduce((total, zone) => total + Number(zone.fee), 0) /
      Math.max(selectedBranch.deliveryZones.length, 1)
    : 0;
  const branchStatus = selectedBranch ? resolveBranchDeliveryStatus(selectedBranch) : "closed";

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
            <PrimaryButton
              href={`/admin/branches/delivery/zones?branch=${selectedBranch?.id ?? ""}&zone=new`}
            >
              <Plus className="size-5" />
              Add new zone
            </PrimaryButton>
          }
          description="Configure delivery zones, fees, and checkout rules for the selected branch."
          meta={
            <form>
              <FormSelect
                className="min-w-[190px]"
                defaultValue={selectedBranch?.id}
                name="branch"
              >
                {data.branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </FormSelect>
            </form>
          }
          title="Delivery"
        />

        {selectedBranch ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,340px)]">
            <div className="min-w-0 space-y-5">
              <Panel className="p-6">
                <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_140px_160px]">
                  <div className="flex items-center gap-5">
                    <BranchIcon tone="green" />
                    <div>
                      <h2 className="text-xl font-semibold text-[#111]">
                        {selectedBranch.name}
                      </h2>
                      <p className="mt-1 text-sm text-[#777]">
                        {selectedBranch.addressText}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <StatusBadge tone={selectedBranch.isAcceptingOrders ? "green" : "gray"}>
                          {selectedBranch.isAcceptingOrders ? "Accepting orders" : "Paused"}
                        </StatusBadge>
                        <StatusBadge tone={branchStatus === "open" ? "green" : "gray"}>
                          {branchStatus === "open"
                            ? "Open"
                            : branchStatus === "paused"
                              ? "Paused"
                              : "Closed"}
                        </StatusBadge>
                      </div>
                    </div>
                  </div>
                  <SummaryStat
                    icon={Target}
                    label="Total zones"
                    value={selectedBranch.deliveryZones.length}
                  />
                  <SummaryStat
                    icon={Wallet}
                    label="Avg. delivery fee"
                    value={formatAdminMoney(avgFee, data.restaurant.defaultCurrency)}
                  />
                </div>
              </Panel>

              <Panel className="p-6">
                <PanelHeader
                  description="Manage radius-based delivery coverage for this branch."
                  title="Delivery zones"
                />
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full min-w-[780px] text-left text-sm text-[#111]">
                    <thead>
                      <tr className="text-xs font-semibold text-[#555]">
                        <th className="px-3 py-3">Zone name</th>
                        <th className="px-3 py-3">Radius</th>
                        <th className="px-3 py-3">Fee</th>
                        <th className="px-3 py-3">Minimum order</th>
                        <th className="px-3 py-3">Sort</th>
                        <th className="px-3 py-3">Status</th>
                        <th className="px-3 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedBranch.deliveryZones.map((zone) => {
                        const isSelected = selectedZone?.id === zone.id;
                        return (
                          <tr
                            className={
                              isSelected
                                ? "rounded-[12px] border border-[#239b53] bg-[#eef8f1]"
                                : "border-b border-[#eeeeea]"
                            }
                            key={zone.id}
                          >
                            <td className="px-3 py-4 font-semibold text-[#111]">
                              {zone.name}
                            </td>
                            <td className="px-3 py-4">
                              Up to {Number(zone.maxDistanceKm ?? 0)} km
                            </td>
                            <td className="px-3 py-4">
                              {formatAdminMoney(zone.fee, data.restaurant.defaultCurrency)}
                            </td>
                            <td className="px-3 py-4">
                              {zone.minimumOrderAmount
                                ? formatAdminMoney(
                                    zone.minimumOrderAmount,
                                    data.restaurant.defaultCurrency,
                                  )
                                : "-"}
                            </td>
                            <td className="px-3 py-4">{zone.sortOrder}</td>
                            <td className="px-3 py-4">
                              <StatusBadge dot tone={zone.isActive ? "green" : "gray"}>
                                {zone.isActive ? "Active" : "Inactive"}
                              </StatusBadge>
                            </td>
                            <td className="px-3 py-4">
                              <div className="flex gap-2">
                                <a
                                  className="flex size-9 items-center justify-center rounded-[10px] border border-[#deded8] bg-white text-[#111]"
                                  href={`/admin/branches/delivery/zones?branch=${selectedBranch.id}&zone=${zone.id}`}
                                >
                                  <Pencil className="size-4 text-[#111]" />
                                </a>
                                <form action={deleteDeliveryZone}>
                                  <input name="deliveryZoneId" type="hidden" value={zone.id} />
                                  <input
                                    name="redirectTo"
                                    type="hidden"
                                    value={`/admin/branches/delivery/zones?branch=${selectedBranch.id}`}
                                  />
                                  <button className="flex size-9 items-center justify-center rounded-[10px] border border-[#deded8] bg-white text-[#111]" type="submit">
                                    <Trash2 className="size-4 text-[#111]" />
                                  </button>
                                </form>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <a
                  className="mt-5 flex h-13 items-center justify-center gap-2 rounded-[12px] border border-dashed border-[#bcbcb6] text-sm font-semibold !text-[#111]"
                  href={`/admin/branches/delivery/zones?branch=${selectedBranch.id}&zone=new`}
                >
                  <Plus className="size-4 !text-[#111]" />
                  Add another zone
                </a>
              </Panel>

              <Panel className="p-6">
                <PanelHeader
                  description="Configure rules that apply during checkout for this branch."
                  title="Checkout rules"
                />
                <form action={createOrUpdateBranch} className="mt-5 space-y-3">
                  <input name="branchId" type="hidden" value={selectedBranch.id} />
                  <input
                    name="redirectTo"
                    type="hidden"
                    value={`/admin/branches/delivery/zones?branch=${selectedBranch.id}`}
                  />
                  <input name="name" type="hidden" value={selectedBranch.name} />
                  <input name="slug" type="hidden" value={selectedBranch.slug} />
                  <input name="phone" type="hidden" value={selectedBranch.phone ?? ""} />
                  <input
                    name="addressText"
                    type="hidden"
                    value={selectedBranch.addressText}
                  />
                  <input
                    name="displayOrder"
                    type="hidden"
                    value={selectedBranch.displayOrder}
                  />
                  {selectedBranch.isTemporarilyClosed ? (
                    <input name="isTemporarilyClosed" type="hidden" value="on" />
                  ) : null}
                  <SettingToggleRow
                    defaultChecked={selectedBranch.isAcceptingOrders}
                    description="Allow customers to place delivery orders."
                    icon={Truck}
                    name="isAcceptingOrders"
                    title="Delivery enabled"
                  />
                  <div className="flex items-center gap-4 rounded-[12px] border border-[#e5e5e1] p-4">
                    <BriefcaseBusiness className="size-10 rounded-[10px] bg-[#f1f1ef] p-2" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#111]">
                        Require minimum order
                      </p>
                      <p className="mt-1 text-xs text-[#777]">
                        Customers must meet the minimum order to place delivery orders.
                      </p>
                    </div>
                    <span className="rounded-[10px] border border-[#deded8] px-4 py-2 text-sm font-semibold">
                      {selectedZone?.minimumOrderAmount
                        ? formatAdminMoney(selectedZone.minimumOrderAmount, data.restaurant.defaultCurrency)
                        : "No minimum"}
                    </span>
                  </div>
                  <SettingToggleRow
                    defaultChecked={selectedBranch.isActive}
                    description="Make this branch visible and selectable in the checkout."
                    icon={Eye}
                    name="isActive"
                    title="Show branch in checkout"
                  />
                  <PrimaryButton className="w-full" type="submit">
                    Save checkout rules
                  </PrimaryButton>
                </form>
              </Panel>
            </div>

            <div className="space-y-5">
              <ZoneEditor
                branchId={selectedBranch.id}
                currency={data.restaurant.defaultCurrency}
                zone={params?.zone === "new" ? undefined : selectedZone}
              />
              <Panel className="p-5">
                <div className="flex items-center gap-4">
                  <Target className="size-14 rounded-full bg-[#ddf5e7] p-4 text-[#239b53]" />
                  <div>
                    <p className="font-semibold text-[#111]">Estimated coverage</p>
                    <p className="mt-1 text-sm text-[#555]">
                      Up to {Number(selectedZone?.maxDistanceKm ?? 0)} km from the branch
                    </p>
                    <p className="mt-1 text-xs text-[#777]">
                      Radius-based fee preview for checkout.
                    </p>
                  </div>
                </div>
              </Panel>
            </div>
          </div>
        ) : null}
      </div>
    </AdminWorkspace>
  );
}

function resolveBranchDeliveryStatus(
  branch: Awaited<ReturnType<typeof getDeliveryZoneManagementData>>["branches"][number],
) {
  if (branch.isTemporarilyClosed) {
    return "closed";
  }

  return branch.isAcceptingOrders ? "open" : "paused";
}

function SummaryStat({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center gap-4 border-l border-[#e7e7e3] pl-6">
      <Icon className="size-12 rounded-full bg-[#ddf5e7] p-3 text-[#239b53]" />
      <div>
        <p className="text-2xl font-semibold text-[#111]">{value}</p>
        <p className="text-sm text-[#777]">{label}</p>
      </div>
    </div>
  );
}

function ZoneEditor({
  branchId,
  zone,
  currency,
}: {
  branchId: string;
  zone?: Awaited<ReturnType<typeof getDeliveryZoneManagementData>>["branches"][number]["deliveryZones"][number];
  currency: string;
}) {
  return (
    <Panel className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-[#111]">Zone editor</h2>
          <p className="mt-2 text-sm text-[#777]">
            Update zone settings and fee calculation.
          </p>
        </div>
        <StatusBadge tone={zone?.isActive ?? true ? "green" : "gray"}>
          {zone?.isActive ?? true ? "Active" : "Inactive"}
        </StatusBadge>
      </div>

      <form action={createOrUpdateDeliveryZone} className="mt-7 space-y-5">
        <input name="branchId" type="hidden" value={branchId} />
        <input name="deliveryZoneId" type="hidden" value={zone?.id ?? ""} />
        <input
          name="redirectTo"
          type="hidden"
          value={`/admin/branches/delivery/zones?branch=${branchId}`}
        />
        <FormField label="Zone name">
          <FormInput defaultValue={zone?.name ?? ""} name="name" placeholder="Up to 3 km" required />
        </FormField>
        <FormField label="Maximum distance (km)">
          <FormInput defaultValue={Number(zone?.maxDistanceKm ?? 3)} min="0.1" name="maxDistanceKm" required step="0.1" type="number" />
        </FormField>
        <FormField label={`Delivery fee (${currency})`}>
          <FormInput defaultValue={Number(zone?.fee ?? 120)} min="0" name="fee" required type="number" />
        </FormField>
        <FormField label={`Minimum order (${currency})`}>
          <FormInput defaultValue={zone?.minimumOrderAmount ? Number(zone.minimumOrderAmount) : ""} min="0" name="minimumOrderAmount" type="number" />
        </FormField>
        <FormField label="Sort order">
          <FormInput defaultValue={zone?.sortOrder ?? 1} name="sortOrder" type="number" />
        </FormField>
        <SettingToggleRow
          defaultChecked={zone?.isActive ?? true}
          description="Use this zone in checkout."
          name="isActive"
          title="Active"
        />
        <div className="rounded-[12px] border border-[#bfe7ce] bg-[#eaf8ef] p-4 text-sm text-[#286444]">
          Customers within this radius will see this delivery fee at checkout.
        </div>
        <PrimaryButton className="w-full" type="submit">
          Save changes
        </PrimaryButton>
      </form>
      {zone ? (
        <form action={deleteDeliveryZone} className="mt-3">
          <input name="deliveryZoneId" type="hidden" value={zone.id} />
          <input
            name="redirectTo"
            type="hidden"
            value={`/admin/branches/delivery/zones?branch=${branchId}`}
          />
          <button className="h-12 w-full rounded-[10px] border border-[#f0a8ae] bg-[#fff4f4] text-sm font-semibold text-[#cc2434]" type="submit">
            Remove zone
          </button>
        </form>
      ) : null}
    </Panel>
  );
}
