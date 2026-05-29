import Link from "next/link";
import { PLATFORM_OWNER } from "@/lib/constants/platform";
import { login } from "./actions";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const errorMessage = resolvedSearchParams?.error;
  const nextPath = resolvedSearchParams?.next ?? "/admin";

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f4efe6_0%,#f7f2eb_100%)] px-6 py-8 text-slate-950 lg:px-8 lg:py-10">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-[1500px] gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <section className="relative overflow-hidden rounded-[2.5rem] border border-black/5 bg-[linear-gradient(140deg,#0f1720_0%,#16231c_58%,#1f3824_100%)] p-8 text-white shadow-[0_30px_120px_rgba(15,23,32,0.18)] lg:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(196,255,95,0.18),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.06),transparent_22%)]" />
          <div className="relative">
            <p className="text-sm font-semibold tracking-[0.3em] text-[#d8ff9d]/72 uppercase">
              {PLATFORM_OWNER}
            </p>
            <div className="mt-10 grid gap-8 xl:grid-cols-[1.02fr_0.98fr]">
              <div className="space-y-6">
                <div className="inline-flex rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs font-semibold tracking-[0.24em] text-white/68 uppercase">
                  Phase 2 Admin Experience
                </div>
                <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl xl:text-6xl">
                  A premium control room for restaurants that still operate on
                  WhatsApp.
                </h1>
                <p className="max-w-xl text-base leading-8 text-white/74 sm:text-lg">
                  NapCart gives owners operational visibility, routing control,
                  and configuration power without forcing store staff to abandon
                  the familiar WhatsApp workflow they already trust.
                </p>
              </div>

              <div className="rounded-[2rem] border border-white/8 bg-white/6 p-5 backdrop-blur">
                <p className="text-xs font-semibold tracking-[0.24em] text-white/46 uppercase">
                  What this login unlocks
                </p>
                <div className="mt-5 grid gap-3">
                  <ValueCard
                    label="Dashboard shell"
                    value="Management control panel"
                    tone="dark"
                  />
                  <ValueCard
                    label="Branch operations"
                    value="Hours, status, and availability"
                    tone="dark"
                  />
                  <ValueCard
                    label="Restaurant identity"
                    value="Branding and fulfillment controls"
                    tone="dark"
                  />
                  <ValueCard
                    label="WhatsApp routing"
                    value="Default and branch-level destinations"
                    tone="dark"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2.5rem] border border-black/5 bg-white/84 p-8 shadow-[0_30px_120px_rgba(15,23,32,0.08)] backdrop-blur lg:p-10">
          <div className="space-y-3">
            <p className="text-sm font-semibold tracking-[0.25em] text-slate-500 uppercase">
              Admin Access
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
              Continue into the NapCart management layer
            </h2>
            <p className="text-base leading-7 text-slate-600">
              Use the restaurant admin account created during seed setup. This is
              the owner and management view, not the staff-side WhatsApp view.
            </p>
          </div>

          {errorMessage ? (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {errorMessage}
            </div>
          ) : null}

          <form className="mt-8 space-y-5">
            <input type="hidden" name="next" value={nextPath} />

            <Field
              id="email"
              label="Email address"
              name="email"
              type="email"
              placeholder="owner@restaurant.com"
            />

            <Field
              id="password"
              label="Password"
              name="password"
              type="password"
              placeholder="Enter your password"
            />

            <button
              formAction={login}
              className="inline-flex w-full items-center justify-center rounded-full bg-[#101a20] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#17262f]"
            >
              Sign in
            </button>
          </form>

          <div className="mt-6 rounded-[1.7rem] border border-lime-200/60 bg-lime-50 px-4 py-4 text-sm leading-6 text-[#355027]">
            Demo admin credentials are generated by the seed script. If you
            need them again locally, rerun the seed and use the printed output.
          </div>

          <div className="mt-6 text-sm text-slate-500">
            <Link className="font-medium text-slate-900 hover:underline" href="/">
              Back to project overview
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({
  id,
  label,
  name,
  type,
  placeholder,
}: {
  id: string;
  label: string;
  name: string;
  type: string;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-700" htmlFor={id}>
        {label}
      </label>
      <input
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none ring-0 transition placeholder:text-slate-400 focus:border-slate-950"
      id={id}
      name={name}
      placeholder={placeholder}
      required
      type={type}
    />
  </div>
  );
}

function ValueCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "dark";
}) {
  return (
    <div
      className={
        tone === "dark"
          ? "rounded-[1.4rem] border border-white/10 bg-white/5 p-4"
          : "rounded-[1.4rem] border border-black/5 bg-white p-4"
      }
    >
      <p className="text-xs font-semibold tracking-[0.18em] text-white/42 uppercase">
        {label}
      </p>
      <p className="mt-2 text-base font-semibold text-white">{value}</p>
    </div>
  );
}
