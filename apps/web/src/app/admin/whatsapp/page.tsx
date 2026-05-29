import {
  CheckboxRow,
  Field,
  SectionHeader,
  StatusPill,
  SubmitButton,
  Surface,
  TextInput,
  Select,
} from "@/components/admin/primitives";
import {
  createOrUpdateWhatsappConnection,
  deleteWhatsappConnection,
} from "@/app/admin/actions";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { getWhatsappSettingsData } from "@/server/repositories/restaurant-admin";

export default async function WhatsappSettingsPage() {
  const session = await requireAdminSession();
  const data = await getWhatsappSettingsData(session.restaurantId);

  return (
    <div className="space-y-4">
      <Surface className="p-6 sm:p-7 lg:p-8">
        <SectionHeader
          eyebrow="WhatsApp routing"
          title="Configure how confirmed orders reach the right restaurant destination"
          description="NapCart keeps WhatsApp as the staff-facing operations channel. Use this screen to store default restaurant routing and branch-specific message destinations without changing how the staff already works."
        />
      </Surface>

      <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
        <Surface className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.24em] text-slate-500 uppercase">
                Add route
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                New WhatsApp connection
              </h2>
            </div>
            <StatusPill tone="neutral">{data.connections.length} saved</StatusPill>
          </div>

          <form action={createOrUpdateWhatsappConnection} className="mt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Provider">
                <Select defaultValue="MOCK" name="provider">
                  <option value="MOCK">Mock</option>
                  <option value="META_CLOUD">Meta Cloud API</option>
                </Select>
              </Field>
              <Field label="Branch route">
                <Select defaultValue="" name="branchId">
                  <option value="">Restaurant default route</option>
                  {data.branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <Field label="Business label">
              <TextInput name="businessName" placeholder="NapCart DHA Ops" required />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Display phone number">
                <TextInput
                  name="displayPhoneNumber"
                  placeholder="+92 300 2222222"
                  required
                />
              </Field>
              <Field label="API base URL">
                <TextInput
                  name="apiBaseUrl"
                  placeholder="https://graph.facebook.com"
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="WhatsApp Business Account ID">
                <TextInput name="whatsappBusinessAccountId" placeholder="WABA ID" />
              </Field>
              <Field label="Phone Number ID">
                <TextInput name="phoneNumberId" placeholder="Phone number ID" />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Access token">
                <TextInput name="accessToken" placeholder="Stored server-side" />
              </Field>
              <Field label="Webhook verify token">
                <TextInput
                  name="webhookVerifyToken"
                  placeholder="Stored server-side"
                />
              </Field>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <CheckboxRow
                defaultChecked
                description="Inactive routes remain stored but won’t be selected operationally."
                label="Connection active"
                name="isActive"
              />
              <CheckboxRow
                description="Use this when no branch-specific route overrides the restaurant-level default."
                label="Set as restaurant default"
                name="isDefaultForRestaurant"
              />
            </div>

            <div className="flex justify-end">
              <SubmitButton>Save WhatsApp route</SubmitButton>
            </div>
          </form>
        </Surface>

        <div className="space-y-4">
          {data.connections.map((connection) => (
            <Surface key={connection.id} className="p-6 sm:p-7">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                  {connection.businessName}
                </h2>
                {connection.isDefaultForRestaurant ? (
                  <StatusPill tone="good">Restaurant default</StatusPill>
                ) : null}
                <StatusPill tone={connection.isActive ? "good" : "warning"}>
                  {connection.isActive ? "Active" : "Paused"}
                </StatusPill>
              </div>
              <p className="mt-2 text-sm leading-7 text-slate-500">
                Connected as{" "}
                {connection.branchId
                  ? data.branches.find((branch) => branch.id === connection.branchId)
                      ?.name ?? "Branch route"
                  : "restaurant-level default route"}
                . Existing secrets are kept server-side unless you overwrite them.
              </p>

              <form action={createOrUpdateWhatsappConnection} className="mt-6 space-y-4">
                <input name="connectionId" type="hidden" value={connection.id} />

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Provider">
                    <Select defaultValue={connection.provider} name="provider">
                      <option value="MOCK">Mock</option>
                      <option value="META_CLOUD">Meta Cloud API</option>
                    </Select>
                  </Field>
                  <Field label="Branch route">
                    <Select defaultValue={connection.branchId ?? ""} name="branchId">
                      <option value="">Restaurant default route</option>
                      {data.branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>

                <Field label="Business label">
                  <TextInput
                    defaultValue={connection.businessName}
                    name="businessName"
                    required
                  />
                </Field>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Display phone number">
                    <TextInput
                      defaultValue={connection.displayPhoneNumber}
                      name="displayPhoneNumber"
                      required
                    />
                  </Field>
                  <Field label="API base URL">
                    <TextInput defaultValue={connection.apiBaseUrl ?? ""} name="apiBaseUrl" />
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="WhatsApp Business Account ID">
                    <TextInput
                      defaultValue={connection.whatsappBusinessAccountId ?? ""}
                      name="whatsappBusinessAccountId"
                    />
                  </Field>
                  <Field label="Phone Number ID">
                    <TextInput
                      defaultValue={connection.phoneNumberId ?? ""}
                      name="phoneNumberId"
                    />
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    hint="Leave blank to keep the stored secret unchanged."
                    label="Replace access token"
                  >
                    <TextInput name="accessToken" placeholder="••••••••••••" />
                  </Field>
                  <Field
                    hint="Leave blank to keep the stored secret unchanged."
                    label="Replace webhook verify token"
                  >
                    <TextInput name="webhookVerifyToken" placeholder="••••••••••••" />
                  </Field>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <CheckboxRow
                    defaultChecked={connection.isActive}
                    description="Inactive routes remain saved for later reactivation."
                    label="Connection active"
                    name="isActive"
                  />
                  <CheckboxRow
                    defaultChecked={connection.isDefaultForRestaurant}
                    description="Only one default restaurant route should be active at a time."
                    label="Set as restaurant default"
                    name="isDefaultForRestaurant"
                  />
                </div>

                <div className="flex flex-wrap justify-between gap-3 pt-2">
                  <button
                    className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                    formAction={deleteWhatsappConnection}
                    type="submit"
                  >
                    Delete route
                  </button>
                  <SubmitButton>Update route</SubmitButton>
                </div>
              </form>
            </Surface>
          ))}

          {!data.connections.length ? (
            <Surface className="p-6 sm:p-7">
              <p className="text-sm leading-7 text-slate-500">
                No WhatsApp routes have been saved yet. Create the default route
                first so incoming orders always have a fallback destination.
              </p>
            </Surface>
          ) : null}
        </div>
      </div>
    </div>
  );
}
