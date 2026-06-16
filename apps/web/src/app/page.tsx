import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonBaseClassName, Surface } from "@/components/admin/primitives";
import {
  DEFAULT_MARKET,
  PLATFORM_NAME,
  PLATFORM_OWNER,
} from "@/lib/constants/platform";
import { cx } from "@/lib/utils/cx";

export default function Home() {
  return (
    <main className="bg-background text-foreground min-h-screen px-4 py-6 lg:px-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <Surface className="p-8 lg:p-10">
          <div className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr]">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                {PLATFORM_OWNER}
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                {PLATFORM_NAME} management foundation
              </h1>
              <p className="text-muted-foreground mt-4 max-w-2xl text-sm leading-6">
                NapCart is a reusable restaurant ordering system for Pakistan,
                with PKR defaults, WhatsApp-first staff operations, and an
                owner-facing admin control layer.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link
                  className={cx(
                    buttonBaseClassName,
                    "bg-primary !text-white hover:bg-primary/90",
                  )}
                  href="/login"
                >
                  Open admin login
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  className={cx(
                    buttonBaseClassName,
                    "border-border bg-background text-foreground hover:bg-muted border",
                  )}
                  href="/admin"
                >
                  View dashboard
                </Link>
                <Link
                  className={cx(
                    buttonBaseClassName,
                    "border-border bg-background text-foreground hover:bg-muted border",
                  )}
                  href="/storefront/smogyice-demo"
                >
                  View Smogy storefront
                </Link>
              </div>
            </div>

            <div className="grid gap-3">
              <StatCard
                label="Launch market"
                value={DEFAULT_MARKET.countryName}
              />
              <StatCard label="Currency" value={DEFAULT_MARKET.currency} />
              <StatCard label="Timezone" value={DEFAULT_MARKET.timezone} />
            </div>
          </div>
        </Surface>

        <div className="grid gap-4 lg:grid-cols-2">
          <Surface className="p-6">
            <p className="text-muted-foreground text-sm font-medium">
              Approved direction
            </p>
            <ul className="text-muted-foreground mt-4 space-y-3 text-sm leading-6">
              <li>Standalone storefront plus admin for MVP.</li>
              <li>
                Meta WhatsApp Cloud API later, mock provider during build.
              </li>
              <li>
                Guest checkout, delivery plus pickup, manual branch selection.
              </li>
              <li>
                Dashboard for management; WhatsApp remains staff operations.
              </li>
            </ul>
          </Surface>

          <Surface className="p-6">
            <p className="text-muted-foreground text-sm font-medium">
              Current build track
            </p>
            <div className="mt-4 space-y-3">
              <PhaseItem title="Project foundation" status="Done" />
              <PhaseItem title="Remote setup" status="Done" />
              <PhaseItem title="Admin UI baseline" status="Done" />
              <PhaseItem title="Storefront checkout" status="Active" />
            </div>
          </Surface>
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border bg-background rounded-lg border p-4">
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="text-foreground mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}

function PhaseItem({ title, status }: { title: string; status: string }) {
  return (
    <div className="border-border bg-background flex items-center justify-between rounded-lg border px-4 py-3">
      <span className="text-foreground text-sm font-medium">{title}</span>
      <span className="bg-muted text-muted-foreground rounded-md px-2 py-1 text-xs font-medium">
        {status}
      </span>
    </div>
  );
}
