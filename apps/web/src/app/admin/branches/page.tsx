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
  archiveBranch,
  createOrUpdateBranch,
  updateBranchOperatingHours,
} from "@/app/admin/actions";
import { DAY_LABELS } from "@/lib/constants/admin";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { getBranchManagementData } from "@/server/repositories/restaurant-admin";

export default async function BranchManagementPage() {
  const session = await requireAdminSession();
  const branches = await getBranchManagementData(session.restaurantId);

  return (
    <div className="space-y-4">
      <Surface className="p-6 sm:p-7 lg:p-8">
        <SectionHeader
          eyebrow="Branch operations"
          title="Manage locations, hours, and order availability"
          description="Each branch can carry its own address, phone, operating schedule, and accepting-orders state. This keeps NapCart flexible for restaurants with one branch today and more tomorrow."
        />
      </Surface>

      <Surface className="p-6 sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.24em] text-slate-500 uppercase">
              Create branch
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              Add a new operational branch
            </h2>
          </div>
          <StatusPill tone="neutral">{branches.length} configured</StatusPill>
        </div>

        <form action={createOrUpdateBranch} className="mt-6 grid gap-4 lg:grid-cols-4">
          <Field id="new-name" label="Branch name">
            <TextInput id="new-name" name="name" placeholder="Clifton Branch" required />
          </Field>
          <Field
            hint="Optional. Leave blank to generate from the branch name."
            id="new-slug"
            label="Branch slug"
          >
            <TextInput id="new-slug" name="slug" placeholder="clifton-branch" />
          </Field>
          <Field id="new-phone" label="Branch phone">
            <TextInput id="new-phone" name="phone" placeholder="+92 300 1234567" />
          </Field>
          <Field id="new-order" label="Display order">
            <TextInput id="new-order" name="displayOrder" placeholder="3" />
          </Field>
          <div className="lg:col-span-3">
            <Field id="new-address" label="Address">
              <TextInput
                id="new-address"
                name="addressText"
                placeholder="Plot 18, Main Boulevard, Lahore"
                required
              />
            </Field>
          </div>
          <div className="flex items-end justify-end">
            <SubmitButton>Create branch</SubmitButton>
          </div>
        </form>
      </Surface>

      <div className="space-y-4">
        {branches.map((branch) => (
          <Surface key={branch.id} className="p-6 sm:p-7">
            <div className="grid gap-6 2xl:grid-cols-[1.02fr_0.98fr]">
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                    {branch.name}
                  </h2>
                  <StatusPill tone={branch.isActive ? "good" : "warning"}>
                    {branch.isActive ? "Active" : "Archived"}
                  </StatusPill>
                  <StatusPill tone={branch.isAcceptingOrders ? "good" : "warning"}>
                    {branch.isAcceptingOrders ? "Accepting orders" : "Paused"}
                  </StatusPill>
                  {branch.isTemporarilyClosed ? (
                    <StatusPill tone="warning">Temporarily closed</StatusPill>
                  ) : null}
                </div>

                <form action={createOrUpdateBranch} className="space-y-4">
                  <input name="branchId" type="hidden" value={branch.id} />

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Branch name">
                      <TextInput defaultValue={branch.name} name="name" required />
                    </Field>
                    <Field label="Branch slug">
                      <TextInput defaultValue={branch.slug} name="slug" />
                    </Field>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Branch phone">
                      <TextInput defaultValue={branch.phone ?? ""} name="phone" />
                    </Field>
                    <Field label="Display order">
                      <TextInput
                        defaultValue={String(branch.displayOrder)}
                        name="displayOrder"
                      />
                    </Field>
                  </div>

                  <Field label="Address">
                    <TextInput defaultValue={branch.addressText} name="addressText" required />
                  </Field>

                  <div className="grid gap-3 md:grid-cols-3">
                    <CheckboxRow
                      defaultChecked={branch.isActive}
                      description="Inactive branches stay in records but disappear from active ops."
                      label="Branch active"
                      name="isActive"
                    />
                    <CheckboxRow
                      defaultChecked={branch.isAcceptingOrders}
                      description="Use this to pause orders without removing the branch."
                      label="Accepting orders"
                      name="isAcceptingOrders"
                    />
                    <CheckboxRow
                      defaultChecked={branch.isTemporarilyClosed}
                      description="Useful for break periods or short-term closures."
                      label="Temporarily closed"
                      name="isTemporarilyClosed"
                    />
                  </div>

                  <div className="flex flex-wrap justify-between gap-3 pt-2">
                    <button
                      className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                      formAction={archiveBranch}
                      type="submit"
                    >
                      Archive branch
                    </button>
                    <SubmitButton>Save branch profile</SubmitButton>
                  </div>
                </form>
              </div>

              <div className="rounded-[1.9rem] border border-slate-200 bg-[#fbfaf7] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.24em] text-slate-500 uppercase">
                      Operating hours
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-slate-950">
                      Weekly schedule
                    </h3>
                  </div>
                  <StatusPill tone="neutral">
                    {branch.whatsappConnections.length} route
                    {branch.whatsappConnections.length === 1 ? "" : "s"}
                  </StatusPill>
                </div>

                <form action={updateBranchOperatingHours} className="mt-5 space-y-3">
                  <input name="branchId" type="hidden" value={branch.id} />

                  {branch.operatingHours.map((hour) => (
                    <div
                      key={hour.dayOfWeek}
                      className="grid gap-3 rounded-[1.35rem] border border-white bg-white p-4 md:grid-cols-[120px_1fr_1fr_150px]"
                    >
                      <div className="flex items-center text-sm font-semibold text-slate-900">
                        {DAY_LABELS[hour.dayOfWeek]}
                      </div>
                      <Field label="Open">
                        <TextInput
                          defaultValue={hour.openTime ?? "11:00"}
                          disabled={hour.isClosed}
                          name={`${hour.dayOfWeek}_openTime`}
                          type="time"
                        />
                      </Field>
                      <Field label="Close">
                        <TextInput
                          defaultValue={hour.closeTime ?? "23:00"}
                          disabled={hour.isClosed}
                          name={`${hour.dayOfWeek}_closeTime`}
                          type="time"
                        />
                      </Field>
                      <div className="flex items-end">
                        <label className="flex h-[50px] w-full items-center justify-center rounded-2xl border border-slate-200 bg-[#fbfaf7] text-sm font-semibold text-slate-700">
                          <input
                            className="mr-2 h-4 w-4"
                            defaultChecked={hour.isClosed}
                            name={`${hour.dayOfWeek}_isClosed`}
                            type="checkbox"
                          />
                          Closed
                        </label>
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-end pt-2">
                    <SubmitButton>Save operating hours</SubmitButton>
                  </div>
                </form>
              </div>
            </div>
          </Surface>
        ))}
      </div>
    </div>
  );
}
