"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV_ITEMS } from "@/lib/constants/admin";
import { cx } from "@/lib/utils/cx";

const iconClassName = "h-4.5 w-4.5";

const ICONS: Record<string, ReactNode> = {
  Dashboard: (
    <svg
      aria-hidden="true"
      className={iconClassName}
      fill="none"
      viewBox="0 0 24 24"
    >
      <rect
        height="7"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
        width="7"
        x="3.5"
        y="3.5"
      />
      <rect
        height="7"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
        width="9"
        x="11.5"
        y="3.5"
      />
      <rect
        height="9"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
        width="7"
        x="3.5"
        y="11.5"
      />
      <rect
        height="9"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
        width="9"
        x="11.5"
        y="11.5"
      />
    </svg>
  ),
  Restaurant: (
    <svg
      aria-hidden="true"
      className={iconClassName}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M4 8.5h16M6 4.5h12l1.5 4v10a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2v-10l1.5-4Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M9 12h6M9 15.5h4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  ),
  Branches: (
    <svg
      aria-hidden="true"
      className={iconClassName}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M12 20.5s6-4.6 6-10a6 6 0 1 0-12 0c0 5.4 6 10 6 10Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="10.5" r="2.25" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
  WhatsApp: (
    <svg
      aria-hidden="true"
      className={iconClassName}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M20 11.5a8 8 0 0 1-11.7 7.1L4 20l1.5-4.1A8 8 0 1 1 20 11.5Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M9.6 9.3c.2-.4.4-.4.8-.4.1 0 .3 0 .4.4l.7 1.6c.1.2 0 .4-.1.6l-.3.4c-.1.1-.2.2 0 .5.5.8 1.2 1.4 2 1.8.2.1.4.1.5 0l.4-.3c.1-.1.4-.2.6-.1l1.5.7c.4.2.4.3.4.4 0 .5-.1 1-.4 1.2-.3.2-.9.5-1.9.3-.9-.2-2.2-.8-3.5-2.1-1.2-1.3-1.8-2.7-2-3.5-.2-.9 0-1.5.3-1.8.2-.3.5-.5.6-.7Z"
        fill="currentColor"
      />
    </svg>
  ),
};

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {ADMIN_NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            className={cx(
              "group flex items-center justify-between rounded-[1.3rem] px-4 py-3 transition",
              isActive
                ? "bg-[#0f1720] text-white shadow-[0_20px_50px_rgba(15,23,32,0.16)]"
                : "text-slate-600 hover:bg-white/70 hover:text-slate-950",
            )}
            href={item.href}
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                className={cx(
                  "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition",
                  isActive
                    ? "bg-white/12 text-[#c4ff5f]"
                    : "bg-white/90 text-slate-700 ring-1 ring-black/5",
                )}
              >
                {ICONS[item.label]}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{item.label}</p>
                <p
                  className={cx(
                    "truncate text-xs",
                    isActive ? "text-white/58" : "text-slate-400",
                  )}
                >
                  {item.description}
                </p>
              </div>
            </div>
            <span
              className={cx(
                "h-2.5 w-2.5 rounded-full transition",
                isActive ? "bg-[#c4ff5f]" : "bg-transparent group-hover:bg-slate-300",
              )}
            />
          </Link>
        );
      })}
    </nav>
  );
}
