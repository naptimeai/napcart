import {
  DollarSign,
  Eye,
  Folder,
  Settings,
  Store,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { updateCatalogSettings } from "@/app/admin/actions";
import {
  AdminWorkspace,
  FormField,
  FormSelect,
  IconBubble,
  PageTitle,
  Panel,
  PrimaryButton,
  SecondaryButton,
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
              <InfoBox>
                Taxes and branch minimum-order rules are not part of Catalog
                Settings in the MVP. Delivery fees and minimums live under
                Branches &gt; Delivery.
              </InfoBox>
              <SaveRow />
            </form>
          </SettingsCard>

          <SettingsCard
            description="Control what customers can browse and order."
            icon={Eye}
            title="Product visibility"
          >
            <div className="space-y-5">
              <InfoBox>
                Product visibility is controlled per product and per branch.
                Unavailable products stay hidden from the storefront order flow.
              </InfoBox>
              <div className="grid gap-3 sm:grid-cols-2">
                <SecondaryButton href="/admin/catalog/categories">
                  <Folder className="size-4" />
                  Categories
                </SecondaryButton>
                <PrimaryButton href="/admin/catalog/products">
                  Manage products
                </PrimaryButton>
              </div>
            </div>
          </SettingsCard>

          <SettingsCard
            description="Branch-specific rules live in the Branches section."
            icon={Store}
            title="Branch & delivery setup"
          >
            <div className="space-y-5">
              <InfoBox>
                Opening hours, temporary closure, delivery zones, delivery fees,
                and minimum-order rules are managed at branch level.
              </InfoBox>
              <div className="grid gap-3 sm:grid-cols-2">
                <SecondaryButton href="/admin/branches">
                  Branches
                </SecondaryButton>
                <PrimaryButton href="/admin/branches/delivery">
                  Delivery settings
                </PrimaryButton>
              </div>
            </div>
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

function InfoBox({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[12px] border border-[var(--admin-primary-soft)] bg-[var(--admin-primary-softer)] p-4 text-sm leading-6 text-[#4d3b5e]">
      {children}
    </div>
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
