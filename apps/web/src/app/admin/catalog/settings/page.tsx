import {
  Bell,
  DollarSign,
  List,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { updateCatalogSettings } from "@/app/admin/actions";
import {
  AdminWorkspace,
  FormField,
  FormInput,
  FormSelect,
  IconBubble,
  PageTitle,
  Panel,
  PrimaryButton,
  SettingToggleRow,
} from "@/components/admin/phase45-ui";
import { PageNotice } from "@/components/admin/primitives";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { getCatalogManagementData } from "@/server/repositories/restaurant-admin";

export default async function CatalogSettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ notice?: string; error?: string }>;
}) {
  const session = await requireAdminSession();
  const data = await getCatalogManagementData(session.restaurantId);
  const params = searchParams ? await searchParams : undefined;
  const settings = data.restaurant.settings;

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
          description="Manage how your catalog works and appears to your customers."
          title="Settings"
        />

        <div className="grid gap-7 xl:grid-cols-2">
          <SettingsCard
            description="Basic information and defaults."
            icon={Settings}
            title="General"
          >
            <form action={updateCatalogSettings} className="space-y-5">
              <input name="settingsSection" type="hidden" value="general" />
              <input
                name="redirectTo"
                type="hidden"
                value="/admin/catalog/settings"
              />
              <FormField
                hint="This is used internally to identify your catalog."
                label="Catalog name"
              >
                <FormInput
                  defaultValue={`${data.restaurant.name} Menu`}
                  name="catalogName"
                />
              </FormField>
              <FormField
                hint="The default language for your catalog."
                label="Default language"
              >
                <FormSelect
                  defaultValue={data.restaurant.defaultLanguage}
                  name="defaultLanguage"
                >
                  <option>English</option>
                </FormSelect>
              </FormField>
              <FormField
                hint="This affects time-based settings and schedules."
                label="Time zone"
              >
                <FormSelect defaultValue={data.restaurant.timezone} name="timezone">
                  <option>Asia/Karachi</option>
                </FormSelect>
              </FormField>
              <SaveRow />
            </form>
          </SettingsCard>

          <SettingsCard
            description="Manage how prices are displayed."
            icon={DollarSign}
            title="Currency & Pricing"
          >
            <form action={updateCatalogSettings} className="space-y-5">
              <input name="settingsSection" type="hidden" value="pricing" />
              <input
                name="redirectTo"
                type="hidden"
                value="/admin/catalog/settings"
              />
              <FormField
                hint="All prices in your catalog will use this currency."
                label="Default currency"
              >
                <FormSelect
                  defaultValue={data.restaurant.defaultCurrency}
                  name="defaultCurrency"
                >
                  <option value="PKR">PKR - Pakistani Rupee</option>
                </FormSelect>
              </FormField>
              <SettingToggleRow
                defaultChecked={settings?.taxEnabled ?? false}
                description="Prices will include tax for customers when enabled."
                name="taxEnabled"
                title="Include tax in prices"
              />
              <FormField
                hint="Used as the default order threshold where needed."
                label="Minimum order amount"
              >
                <FormInput
                  defaultValue={settings?.minimumOrderAmount?.toString() ?? ""}
                  name="minimumOrderAmount"
                  placeholder="500"
                  type="number"
                />
              </FormField>
              <SaveRow />
            </form>
          </SettingsCard>

          <SettingsCard
            description="Control how your catalog behaves."
            icon={List}
            title="Catalog behavior"
          >
            <form action={updateCatalogSettings} className="space-y-5">
              <input name="settingsSection" type="hidden" value="behavior" />
              <input
                name="redirectTo"
                type="hidden"
                value="/admin/catalog/settings"
              />
              <SettingToggleRow
                defaultChecked={settings?.deliveryEnabled ?? true}
                description="Allow products to be ordered for delivery."
                name="deliveryEnabled"
                title="Delivery enabled"
              />
              <SettingToggleRow
                defaultChecked={settings?.pickupEnabled ?? true}
                description="Allow products to be ordered for pickup."
                name="pickupEnabled"
                title="Pickup enabled"
              />
              <SettingToggleRow
                defaultChecked={settings?.showBranchSelection ?? true}
                description="Let customers select their preferred branch."
                name="showBranchSelection"
                title="Show branch selection"
              />
              <SaveRow />
            </form>
          </SettingsCard>

          <SettingsCard
            description="Manage customer alerts and updates."
            icon={Bell}
            title="Notifications"
          >
            <form action={updateCatalogSettings} className="space-y-5">
              <input name="settingsSection" type="hidden" value="notifications" />
              <input
                name="redirectTo"
                type="hidden"
                value="/admin/catalog/settings"
              />
              <SettingToggleRow
                defaultChecked={settings?.customerNotificationsEnabled ?? false}
                description="Send customer-facing updates when supported."
                name="customerNotificationsEnabled"
                title="Customer notifications"
              />
              <SettingToggleRow
                defaultChecked={false}
                description="Receive email when your catalog is published."
                name="catalogUpdates"
                title="Catalog updates"
              />
              <SettingToggleRow
                defaultChecked={false}
                description="Get a weekly summary of catalog activity."
                name="weeklySummary"
                title="Weekly summary"
              />
              <SaveRow />
            </form>
          </SettingsCard>
        </div>
      </div>
    </AdminWorkspace>
  );
}

function SettingsCard({
  icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Panel className="min-h-[420px] p-7">
      <div className="mb-7 flex items-start gap-4">
        <IconBubble className="size-12" icon={icon} tone="gray" />
        <div>
          <h2 className="text-lg font-semibold text-[#111]">{title}</h2>
          <p className="mt-1 text-sm text-[#777]">{description}</p>
        </div>
      </div>
      {children}
    </Panel>
  );
}

function SaveRow() {
  return (
    <div className="flex justify-end pt-2">
      <PrimaryButton className="h-10 min-w-[130px]" type="submit">
        Save changes
      </PrimaryButton>
    </div>
  );
}
