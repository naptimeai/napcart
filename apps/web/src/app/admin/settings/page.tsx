import Image from "next/image";
import {
  CheckboxRow,
  Field,
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

export default async function RestaurantSettingsPage() {
  const session = await requireAdminSession();
  const restaurant = await getRestaurantSettingsData(session.restaurantId);

  return (
    <div className="space-y-4">
      <Surface className="p-6 sm:p-7 lg:p-8">
        <SectionHeader
          eyebrow="Restaurant configuration"
          title="Shape the operating identity your clients will actually experience"
          description="Phase 2 turns your restaurant record into a controllable brand surface. Update core identity, storefront-facing contact points, and the operating controls that determine whether NapCart should accept orders."
        />
      </Surface>

      <div className="grid gap-4 xl:grid-cols-[1.06fr_0.94fr]">
        <Surface className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.24em] text-slate-500 uppercase">
                Identity and branding
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
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
              <div className="rounded-[1.7rem] border border-slate-200 bg-[#fbfaf7] p-4">
                <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
                  Current mark
                </p>
                <div className="mt-4 flex h-[170px] items-center justify-center rounded-[1.4rem] bg-white ring-1 ring-black/5">
                  {restaurant.logoUrl ? (
                    <Image
                      alt={restaurant.name}
                      className="h-24 w-24 rounded-[1.4rem] object-cover"
                      height={96}
                      src={restaurant.logoUrl}
                      width={96}
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-[1.4rem] bg-[#101a20] text-2xl font-semibold text-[#c4ff5f]">
                      {restaurant.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[1.7rem] border border-dashed border-slate-200 bg-[#fbfaf7] p-5">
                <p className="text-sm font-semibold text-slate-950">
                  Logo upload pipeline
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  This upload uses the live Supabase project and stores images in
                  a reusable asset bucket so the same pipeline can serve future
                  product images as well.
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
              <p className="text-xs font-semibold tracking-[0.24em] text-slate-500 uppercase">
                Fulfillment controls
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Operational settings
              </h2>
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
                description="Master switch for whether the restaurant is currently taking orders."
                label="Accepting orders"
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
            <p className="text-xs font-semibold tracking-[0.24em] text-slate-500 uppercase">
              Asset system
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              Image plumbing status
            </h2>
            <div className="mt-5 space-y-3">
              <div className="rounded-[1.5rem] border border-slate-200 bg-[#fbfaf7] p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Branding assets
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  Restaurant logo uploads are live and stored in the shared
                  NapCart asset bucket.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-[#fbfaf7] p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Product image readiness
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  The same upload helper is already structured for
                  `restaurants/&lt;slug&gt;/products/...` paths, so catalog
                  image uploads can attach directly in Phase 3 without redoing
                  storage architecture.
                </p>
              </div>
            </div>
          </Surface>
        </div>
      </div>
    </div>
  );
}
