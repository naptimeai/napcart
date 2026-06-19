import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Building2,
  MapPinned,
  MessageCircleMore,
  ShoppingBasket,
  Truck,
} from "lucide-react";
import {
  CheckboxRow,
  Field,
  PageNotice,
  SectionHeader,
  StatusPill,
  SubmitButton,
  Surface,
  TextInput,
} from "@/components/admin/primitives";
import {
  updateRestaurantIdentity,
  updateRestaurantOperationalSettings,
} from "@/app/admin/actions";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { getRestaurantSettingsData } from "@/server/repositories/restaurant-admin";

export default async function RestaurantSettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{
    notice?: string;
    error?: string;
  }>;
}) {
  const session = await requireAdminSession();
  const restaurant = await getRestaurantSettingsData(session.restaurantId);
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

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
          eyebrow="Settings workspace"
          title="Restaurant, branch, and WhatsApp settings"
          description="Manage the core operational setup from one place, then jump into the exact area you want to update."
        />
      </Surface>

      <div className="grid gap-4 xl:grid-cols-5">
        <SettingsNavCard
          description="Edit identity, contact details, fulfillment controls, and restaurant-wide launch settings."
          href="/admin/settings"
          icon={<Building2 className="size-5" />}
          isCurrent
          title="Restaurant profile"
        />
        <SettingsNavCard
          description="Maintain branches, addresses, opening hours, temporary closure, and accepting-order status."
          href="/admin/branches"
          icon={<MapPinned className="size-5" />}
          title="Branches"
        />
        <SettingsNavCard
          description="Configure default and branch-specific WhatsApp routes for order delivery to staff."
          href="/admin/whatsapp"
          icon={<MessageCircleMore className="size-5" />}
          title="WhatsApp routing"
        />
        <SettingsNavCard
          description="Manage categories, products, product images, variations, add-ons, and branch availability."
          href="/admin/catalog"
          icon={<ShoppingBasket className="size-5" />}
          title="Catalog"
        />
        <SettingsNavCard
          description="Set branch-wise delivery radius zones, fees, and minimum order rules."
          href="/admin/branches/delivery"
          icon={<Truck className="size-5" />}
          title="Delivery"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.06fr_0.94fr]">
        <Surface className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Identity and branding
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                Restaurant profile
              </h2>
            </div>
            <StatusPill tone="good">Live record</StatusPill>
          </div>

          <form action={updateRestaurantIdentity} className="mt-6 space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <Field id="name" label="Restaurant name">
                <TextInput
                  defaultValue={restaurant.name}
                  id="name"
                  name="name"
                  placeholder="NapCart Kitchen"
                  required
                />
              </Field>

              <Field
                id="slug"
                hint="Leave blank to generate from the restaurant name."
                label="Public slug"
              >
                <TextInput
                  defaultValue={restaurant.slug}
                  id="slug"
                  name="slug"
                  placeholder="napcart-kitchen"
                />
              </Field>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field id="supportPhone" label="Support phone">
                <TextInput
                  defaultValue={restaurant.supportPhone}
                  id="supportPhone"
                  name="supportPhone"
                  placeholder="+92 300 0000000"
                  required
                />
              </Field>

              <Field id="contactEmail" label="Contact email">
                <TextInput
                  defaultValue={restaurant.contactEmail ?? ""}
                  id="contactEmail"
                  name="contactEmail"
                  placeholder="hello@restaurant.com"
                  type="email"
                />
              </Field>
            </div>

            <div className="grid gap-5 md:grid-cols-[220px_1fr]">
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  Current mark
                </p>
                <div className="mt-4 flex h-[170px] items-center justify-center rounded-lg bg-card ring-1 ring-border">
                  {restaurant.logoUrl ? (
                    <Image
                      alt={restaurant.name}
                      className="h-24 w-24 rounded-lg object-cover"
                      height={96}
                      src={restaurant.logoUrl}
                      width={96}
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-primary text-2xl font-semibold text-primary-foreground">
                      {restaurant.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-dashed border-border bg-background p-5">
                <p className="text-sm font-semibold text-foreground">
                  Logo upload
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Upload the restaurant logo used by the admin and future storefront.
                </p>
                <Field
                  hint="PNG, JPG, WEBP up to 5MB."
                  label="Replace restaurant logo"
                >
                  <TextInput accept="image/*" name="logo" type="file" />
                </Field>
              </div>
            </div>

            <div className="flex justify-end">
              <SubmitButton>Save restaurant profile</SubmitButton>
            </div>
          </form>
        </Surface>

        <div className="space-y-4">
          <Surface className="p-6 sm:p-7">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Restaurant-wide fulfillment defaults
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                Global operational settings
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Use these as restaurant-level controls. Individual branch pause,
                closure, and availability controls live inside the branch settings
                page.
              </p>
            </div>

            <form
              action={updateRestaurantOperationalSettings}
              className="mt-6 space-y-4"
            >
              <Field
                hint="Used for delivery validation in the checkout flow."
                id="minimumOrderAmount"
                label="Minimum order amount"
              >
                <TextInput
                  defaultValue={
                    restaurant.settings?.minimumOrderAmount?.toString() ?? ""
                  }
                  id="minimumOrderAmount"
                  name="minimumOrderAmount"
                  placeholder="500"
                />
              </Field>

              <CheckboxRow
                defaultChecked={restaurant.settings?.deliveryEnabled ?? true}
                description="Allow delivery orders across active delivery zones."
                label="Delivery enabled"
                name="deliveryEnabled"
              />
              <CheckboxRow
                defaultChecked={restaurant.settings?.pickupEnabled ?? true}
                description="Allow customer pickup as a checkout option."
                label="Pickup enabled"
                name="pickupEnabled"
              />
              <CheckboxRow
                defaultChecked={restaurant.settings?.isAcceptingOrders ?? true}
                description="Master switch for whether the whole restaurant should accept orders at all."
                label="Restaurant accepting orders"
                name="isAcceptingOrders"
              />
              <CheckboxRow
                defaultChecked={restaurant.settings?.isGloballyClosed ?? false}
                description="Use this when the whole restaurant must appear closed regardless of branch state."
                label="Mark restaurant globally closed"
                name="isGloballyClosed"
              />

              <div className="flex justify-end pt-2">
                <SubmitButton>Save operational settings</SubmitButton>
              </div>
            </form>
          </Surface>

          <Surface className="p-6 sm:p-7">
            <p className="text-xs font-medium text-muted-foreground">
              Asset system
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              Launch notes
            </h2>
            <div className="mt-5 space-y-3">
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-sm font-semibold text-foreground">
                  Branding assets
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Restaurant logo uploads are stored in the shared NapCart asset bucket.
                </p>
              </div>
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-sm font-semibold text-foreground">
                  Branch-level overrides
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Each branch can pause orders or mark itself temporarily closed
                  without affecting the other branches.
                </p>
                <Link
                  className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  href="/admin/branches"
                >
                  Open branch settings
                  <ArrowRight className="size-4" />
                </Link>
              </div>
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-sm font-semibold text-foreground">
                  Product image readiness
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  The same storage pattern will support product images in catalog management.
                </p>
              </div>
            </div>
          </Surface>
        </div>
      </div>
    </div>
  );
}

function SettingsNavCard({
  href,
  title,
  description,
  icon,
  isCurrent = false,
}: {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
  isCurrent?: boolean;
}) {
  return (
    <Link
      className="group rounded-[22px] border border-border/80 bg-card p-6 text-card-foreground shadow-[0_18px_60px_rgba(16,18,16,0.04)] transition hover:border-primary/30 hover:bg-muted/30"
      href={href}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="flex size-11 items-center justify-center rounded-2xl border border-[var(--admin-primary-border)] bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]">
          {icon}
        </span>
        <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {isCurrent ? "Current" : "Open"}
        </span>
      </div>
      <h2 className="mt-5 text-xl font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-foreground">
        Open settings
        <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
