import { logout } from "@/app/login/actions";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { getAdminDashboardSummary } from "@/server/repositories/admin-users";

export default async function AdminPage() {
  const session = await requireAdminSession();
  const summary = await getAdminDashboardSummary(session.restaurantId);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fef6ec_0%,#f7ebde_42%,#f0e2d2_100%)] px-6 py-10 text-slate-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="overflow-hidden rounded-[2rem] border border-black/5 bg-white/80 shadow-[0_24px_80px_rgba(110,67,22,0.08)] backdrop-blur">
          <div className="grid gap-10 px-8 py-10 lg:grid-cols-[1.25fr_0.85fr] lg:px-12 lg:py-12">
            <div className="space-y-5">
              <div className="inline-flex items-center rounded-full border border-emerald-900/10 bg-emerald-100 px-4 py-1 text-sm font-semibold tracking-wide text-emerald-900">
                Phase 1 Admin Access Ready
              </div>
              <div className="space-y-3">
                <p className="text-sm font-semibold tracking-[0.25em] text-amber-900/70 uppercase">
                  Restaurant Scope
                </p>
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                  {session.restaurantName}
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-700">
                  You’re signed in as {session.adminName}. This dashboard is
                  currently focused on Phase 1 validation: restaurant-scoped
                  access, data readiness, and admin authentication foundations.
                </p>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-950/8 bg-slate-950 p-6 text-white shadow-inner">
              <p className="text-sm font-semibold tracking-[0.25em] text-amber-200/80 uppercase">
                Auth Context
              </p>
              <dl className="mt-6 space-y-4 text-sm">
                <InfoRow label="Admin email" value={session.adminEmail} />
                <InfoRow label="Restaurant slug" value={session.restaurantSlug} />
                <InfoRow label="Restaurant ID" value={session.restaurantId} />
                <InfoRow label="Admin user ID" value={session.adminUserId} />
              </dl>

              <form className="mt-8">
                <button
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-50"
                  formAction={logout}
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Branches"
            value={summary.branchesCount}
            note="Active restaurant branches"
          />
          <MetricCard
            label="Categories"
            value={summary.categoriesCount}
            note="Catalog categories seeded"
          />
          <MetricCard
            label="Products"
            value={summary.productsCount}
            note="Sellable active items"
          />
          <MetricCard
            label="Customers"
            value={summary.customersCount}
            note="Known customer records"
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[1.75rem] border border-black/5 bg-white/82 p-8 shadow-[0_20px_60px_rgba(110,67,22,0.06)]">
            <p className="text-sm font-semibold tracking-[0.25em] text-slate-500 uppercase">
              Order Status Snapshot
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <StatusCard
                label="Pending Confirmation"
                value={summary.pendingConfirmationOrdersCount}
                tone="amber"
              />
              <StatusCard
                label="Confirmed"
                value={summary.confirmedOrdersCount}
                tone="emerald"
              />
              <StatusCard
                label="Cancelled"
                value={summary.cancelledOrdersCount}
                tone="rose"
              />
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-black/5 bg-[#fff8f1] p-8 shadow-[0_20px_60px_rgba(110,67,22,0.06)]">
            <p className="text-sm font-semibold tracking-[0.25em] text-amber-900/70 uppercase">
              Phase 1 Outcome
            </p>
            <ul className="mt-6 space-y-3 text-base leading-7 text-slate-700">
              <li>Prisma schema translated from the approved ERD.</li>
              <li>Supabase Auth linked to `admin_users`.</li>
              <li>Admin access resolves the correct restaurant scope.</li>
              <li>Seeded demo data supports local development and review.</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}

function MetricCard({
  label,
  value,
  note,
}: {
  label: string;
  value: number;
  note: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-black/5 bg-white/80 p-6 shadow-[0_20px_60px_rgba(110,67,22,0.06)]">
      <p className="text-sm font-semibold tracking-[0.18em] text-slate-500 uppercase">
        {label}
      </p>
      <p className="mt-4 text-4xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{note}</p>
    </div>
  );
}

function StatusCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "amber" | "emerald" | "rose";
}) {
  const toneClassName =
    tone === "emerald"
      ? "border-emerald-200 bg-emerald-50 text-emerald-950"
      : tone === "rose"
        ? "border-rose-200 bg-rose-50 text-rose-950"
        : "border-amber-200 bg-amber-50 text-amber-950";

  return (
    <div className={`rounded-[1.4rem] border p-5 ${toneClassName}`}>
      <p className="text-sm font-semibold tracking-[0.18em] uppercase">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-white/55">{label}</dt>
      <dd className="mt-1 break-all font-medium text-white">{value}</dd>
    </div>
  );
}
