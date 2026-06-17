import { Clock, MapPin, Plus, Settings2, Store, Truck } from "lucide-react";
import {
  createOrUpdateBranch,
  updateRestaurantOperationalSettings,
} from "@/app/admin/actions";
import {
  AdminWorkspace,
  FormField,
  FormInput,
  IconBubble,
  PageTitle,
  Panel,
  PanelHeader,
  PrimaryButton,
  SettingToggleRow,
  StatusBadge,
} from "@/components/admin/phase45-ui";
import { PageNotice } from "@/components/admin/primitives";
import { requireAdminSession } from "@/lib/auth/admin-session";
import {
  getBranchManagementData,
  getRestaurantSettingsData,
} from "@/server/repositories/restaurant-admin";

export default async function BranchSettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ notice?: string; error?: string }>;
}) {
  const session = await requireAdminSession();
  const params = searchParams ? await searchParams : undefined;
  const [branches, restaurant] = await Promise.all([
    getBranchManagementData(session.restaurantId),
    getRestaurantSettingsData(session.restaurantId),
  ]);
  const settings = restaurant.settings;

  return (
    <AdminWorkspace>
      <div className="space-y-7">
        {typeof params?.notice === "string" ? (
          <PageNotice message={params.notice} />
        ) : null}
        {typeof params?.error === "string" ? (
          <PageNotice message={params.error} tone="error" />
        ) : null}

        <PageTitle
          description="Create branches and manage branch-wide ordering defaults."
          title="Branch settings"
        />

        <div className="grid gap-7 xl:grid-cols-[0.95fr_1.05fr]">
          <Panel className="p-7">
            <PanelHeader
              action={<IconBubble icon={Plus} tone="gray" />}
              description="Add a new restaurant branch with default opening hours."
              title="Add branch"
            />
            <form action={createOrUpdateBranch} className="mt-7 space-y-5">
              <input name="redirectTo" type="hidden" value="/admin/branches" />
              <FormField label="Branch name">
                <FormInput
                  name="name"
                  placeholder="e.g. DHA Phase 6"
                  required
                />
              </FormField>
              <FormField
                hint="Leave blank and NapCart will create a clean URL slug."
                label="Branch slug"
              >
                <FormInput name="slug" placeholder="dha-phase-6" />
              </FormField>
              <FormField label="Phone number">
                <FormInput name="phone" placeholder="0300-0000000" />
              </FormField>
              <FormField label="Address">
                <FormInput
                  name="addressText"
                  placeholder="Street, area, city"
                  required
                />
              </FormField>
              <FormField
                hint="Lower numbers appear first in branch lists."
                label="Sort order"
              >
                <FormInput defaultValue="0" name="displayOrder" type="number" />
              </FormField>
              <PrimaryButton className="w-full" type="submit">
                Create branch
              </PrimaryButton>
            </form>
          </Panel>

          <div className="grid gap-7">
            <Panel className="p-7">
              <PanelHeader
                description="These defaults guide checkout behavior across all branches."
                title="Ordering defaults"
              />
              <form
                action={updateRestaurantOperationalSettings}
                className="mt-7 space-y-4"
              >
                <SettingToggleRow
                  defaultChecked={settings?.isAcceptingOrders ?? true}
                  description="Allow branches to receive customer orders."
                  icon={Store}
                  name="isAcceptingOrders"
                  title="Accepting orders"
                />
                <SettingToggleRow
                  defaultChecked={settings?.deliveryEnabled ?? true}
                  description="Enable delivery as a supported fulfillment type."
                  icon={Truck}
                  name="deliveryEnabled"
                  title="Delivery enabled"
                />
                <SettingToggleRow
                  defaultChecked={settings?.pickupEnabled ?? true}
                  description="Enable pickup as a supported fulfillment type."
                  icon={MapPin}
                  name="pickupEnabled"
                  title="Pickup enabled"
                />
                <SettingToggleRow
                  defaultChecked={settings?.isGloballyClosed ?? false}
                  description="Temporarily stop accepting orders across all branches."
                  icon={Clock}
                  name="isGloballyClosed"
                  title="Mark restaurant closed"
                />
                <FormField
                  hint="Optional fallback used when branch delivery rules do not set a minimum."
                  label="Default minimum order amount"
                >
                  <FormInput
                    defaultValue={settings?.minimumOrderAmount?.toString() ?? ""}
                    name="minimumOrderAmount"
                    placeholder="500"
                    type="number"
                  />
                </FormField>
                <PrimaryButton className="w-full" type="submit">
                  Save defaults
                </PrimaryButton>
              </form>
            </Panel>

            <Panel className="p-7">
              <PanelHeader
                description="A quick health check for branch setup."
                title="Branch setup summary"
              />
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <SummaryTile
                  label="Total branches"
                  value={branches.length}
                />
                <SummaryTile
                  label="Active branches"
                  value={branches.filter((branch) => branch.isActive).length}
                />
                <SummaryTile
                  label="Accepting orders"
                  value={
                    branches.filter((branch) => branch.isAcceptingOrders).length
                  }
                />
              </div>
              <div className="mt-6 space-y-3">
                {branches.slice(0, 4).map((branch) => (
                  <div
                    className="flex items-center justify-between rounded-[12px] border border-[#e5e5e1] p-4"
                    key={branch.id}
                  >
                    <div className="flex items-center gap-3">
                      <Store className="size-10 rounded-full bg-[#f1f1ef] p-2 text-[#111]" />
                      <div>
                        <p className="font-semibold text-[#111]">{branch.name}</p>
                        <p className="mt-1 text-xs text-[#777]">
                          {branch.addressText}
                        </p>
                      </div>
                    </div>
                    <StatusBadge dot tone={branch.isActive ? "green" : "gray"}>
                      {branch.isActive ? "Active" : "Inactive"}
                    </StatusBadge>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </AdminWorkspace>
  );
}

function SummaryTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[14px] border border-[#e5e5e1] bg-white p-5">
      <Settings2 className="size-10 rounded-full bg-[var(--admin-primary-soft)] p-2.5 text-[var(--admin-primary)]" />
      <p className="mt-4 text-3xl font-semibold text-[#111]">{value}</p>
      <p className="mt-1 text-sm text-[#777]">{label}</p>
    </div>
  );
}
