import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { logoutFromAdmin } from "@/app/admin/actions";
import { SidebarNav } from "@/components/admin/sidebar-nav";
import { Surface } from "@/components/admin/primitives";
import { requireAdminSession } from "@/lib/auth/admin-session";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireAdminSession();

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f4efe6_0%,#f7f2eb_100%)] px-4 py-4 text-slate-950 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
      <div className="mx-auto grid max-w-[1600px] gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-4">
          <Surface className="overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f8f6f1_100%)] p-5">
            <div className="flex items-center gap-4">
              {session.restaurantLogoUrl ? (
                <Image
                  alt={session.restaurantName}
                  className="h-14 w-14 rounded-[1.3rem] object-cover ring-1 ring-black/5"
                  height={56}
                  src={session.restaurantLogoUrl}
                  width={56}
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-[1.3rem] bg-[#0f1720] text-lg font-semibold text-[#c4ff5f]">
                  {session.restaurantName.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-[0.28em] text-slate-500 uppercase">
                  NapCart Admin
                </p>
                <h2 className="truncate text-lg font-semibold text-slate-950">
                  {session.restaurantName}
                </h2>
                <p className="truncate text-sm text-slate-500">
                  {session.adminName}
                </p>
              </div>
            </div>

            <div className="mt-8">
              <SidebarNav />
            </div>

            <div className="mt-8 rounded-[1.7rem] bg-[#101a20] p-5 text-white shadow-[0_20px_50px_rgba(16,26,32,0.2)]">
              <p className="text-xs font-semibold tracking-[0.24em] text-white/45 uppercase">
                Operations note
              </p>
              <p className="mt-3 text-sm leading-7 text-white/72">
                Phase 2 turns NapCart into a real control panel for restaurant
                owners. Store staff can stay in WhatsApp while management uses
                this space to steer the operation.
              </p>
              <div className="mt-5 flex gap-3">
                <Link
                  className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-[#f3ffda]"
                  href="/admin/settings"
                >
                  Open settings
                </Link>
                <Link
                  className="inline-flex rounded-full border border-white/12 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/8"
                  href="/admin/whatsapp"
                >
                  Review routing
                </Link>
              </div>
            </div>
          </Surface>
        </aside>

        <div className="flex min-w-0 flex-col gap-4">
          <Surface className="p-4 sm:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex min-w-0 flex-1 items-center gap-3 rounded-[1.6rem] border border-slate-200 bg-[#fbfaf7] px-4 py-3">
                <span className="text-slate-400">
                  <svg
                    aria-hidden="true"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      cx="11"
                      cy="11"
                      r="6.5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <path
                      d="m16 16 4.2 4.2"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="1.8"
                    />
                  </svg>
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-950">
                    Search dashboard tools, settings, and branches
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    Command palette and deep admin search arrive in a later
                    phase.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
                  Pakistan · PKR
                </div>
                <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
                  Restaurant scope active
                </div>
                <form action={logoutFromAdmin}>
                  <button className="inline-flex rounded-full bg-[#0f1720] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#17262f]">
                    Sign out
                  </button>
                </form>
              </div>
            </div>
          </Surface>

          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </main>
  );
}
