import {
  DEFAULT_MARKET,
  PLATFORM_NAME,
  PLATFORM_OWNER,
} from "@/lib/constants/platform";

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fff4e8_0%,#f7ecdf_42%,#f2e4d2_100%)] px-6 py-10 text-slate-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="overflow-hidden rounded-[2rem] border border-black/5 bg-white/80 shadow-[0_24px_80px_rgba(110,67,22,0.08)] backdrop-blur">
          <div className="grid gap-10 px-8 py-10 lg:grid-cols-[1.4fr_0.9fr] lg:px-12 lg:py-14">
            <div className="space-y-6">
              <div className="inline-flex items-center rounded-full border border-amber-900/10 bg-amber-100 px-4 py-1 text-sm font-medium tracking-wide text-amber-900">
                Phase 0 Foundation in Progress
              </div>
              <div className="space-y-4">
                <p className="text-sm font-semibold tracking-[0.25em] text-amber-900/70 uppercase">
                  {PLATFORM_OWNER}
                </p>
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                  {PLATFORM_NAME} is now scaffolded and ready for the real
                  build.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-700">
                  This workspace has moved past planning artifacts and into
                  execution. The approved MVP is being prepared as a reusable
                  restaurant ordering system for {DEFAULT_MARKET.countryName},
                  with {DEFAULT_MARKET.currency} defaults, WhatsApp-first staff
                  operations, and a clean multi-tenant-ready backend.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <StatCard
                  label="Launch Market"
                  value={DEFAULT_MARKET.countryName}
                />
                <StatCard
                  label="Default Currency"
                  value={DEFAULT_MARKET.currency}
                />
                <StatCard label="Timezone" value={DEFAULT_MARKET.timezone} />
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-amber-900/10 bg-slate-950 p-6 text-white shadow-inner">
              <p className="text-sm font-semibold tracking-[0.25em] text-amber-200/80 uppercase">
                Current Build Track
              </p>
              <div className="mt-6 space-y-4">
                <PhaseItem
                  title="Project foundation"
                  description="Next.js app, shared config, Prisma base, and environment template."
                  active
                />
                <PhaseItem
                  title="Remote setup"
                  description="GitHub repository, Vercel project, and Supabase project linkage."
                />
                <PhaseItem
                  title="Schema + auth"
                  description="Translate the approved ERD and establish restaurant-scoped admin access."
                />
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.75rem] border border-black/5 bg-white/80 p-8 shadow-[0_20px_60px_rgba(110,67,22,0.06)]">
            <p className="text-sm font-semibold tracking-[0.25em] text-slate-500 uppercase">
              Approved Direction
            </p>
            <ul className="mt-6 space-y-3 text-base leading-7 text-slate-700">
              <li>
                Standalone storefront + admin for MVP, with API-first backend
                design.
              </li>
              <li>
                Meta WhatsApp Cloud API as the real provider, with mock mode for
                development.
              </li>
              <li>
                Guest checkout, delivery + pickup, manual branch selection, and
                PKR defaults.
              </li>
              <li>
                Dashboard for management visibility while restaurant staff
                continue operating from WhatsApp.
              </li>
            </ul>
          </div>

          <div className="rounded-[1.75rem] border border-black/5 bg-[#fff7ef] p-8 shadow-[0_20px_60px_rgba(110,67,22,0.06)]">
            <p className="text-sm font-semibold tracking-[0.25em] text-amber-900/70 uppercase">
              Immediate Next Actions
            </p>
            <ol className="mt-6 space-y-4 text-base leading-7 text-slate-700">
              <li>
                Finish remote project setup under the Naptime AI accounts.
              </li>
              <li>
                Lock environment wiring for Supabase, Vercel, and WhatsApp mock
                defaults.
              </li>
              <li>
                Start translating the approved ERD into the real Prisma schema.
              </li>
            </ol>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-black/5 bg-[#fff8f1] p-4">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function PhaseItem({
  title,
  description,
  active = false,
}: {
  title: string;
  description: string;
  active?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">{title}</h2>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold tracking-[0.2em] uppercase ${
            active
              ? "bg-emerald-300 text-emerald-950"
              : "bg-white/10 text-white/70"
          }`}
        >
          {active ? "Active" : "Queued"}
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-white/70">{description}</p>
    </div>
  );
}
