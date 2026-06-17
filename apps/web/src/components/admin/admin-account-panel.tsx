"use client";

import * as React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { KeyRound, LogOut, ShieldCheck, Store, UserRound } from "lucide-react";
import { changeAdminPassword, logoutFromAdmin } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type AdminAccountPanelProps = {
  adminEmail: string;
  adminName: string;
  restaurantLogoUrl: string | null;
  restaurantName: string;
  restaurantSlug: string;
  triggerVariant: "header" | "sidebar-expanded" | "sidebar-collapsed";
};

export function AdminAccountPanel({
  adminEmail,
  adminName,
  restaurantLogoUrl,
  restaurantName,
  restaurantSlug,
  triggerVariant,
}: AdminAccountPanelProps) {
  const [open, setOpen] = React.useState(false);
  const [confirmSignOut, setConfirmSignOut] = React.useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        aria-label={`Admin profile: ${adminName}`}
        className={getTriggerClassName(triggerVariant)}
        title={`${adminName} · ${adminEmail}`}
        type="button"
        onClick={() => setOpen(true)}
      >
        <AccountAvatar
          adminName={adminName}
          restaurantLogoUrl={restaurantLogoUrl}
          restaurantName={restaurantName}
          size={triggerVariant === "header" ? "sm" : "default"}
        />

        {triggerVariant === "sidebar-expanded" ? (
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-sm font-medium">{adminName}</p>
            <p className="truncate text-xs text-muted-foreground">
              {adminEmail}
            </p>
          </div>
        ) : null}
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full overflow-hidden sm:max-w-md" side="right">
          <SheetHeader className="border-b border-border px-6 py-5">
            <SheetTitle>Admin account</SheetTitle>
            <SheetDescription>
              Review account info, update your password, or sign out securely.
            </SheetDescription>
          </SheetHeader>

          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-start gap-3">
                  <AccountAvatar
                    adminName={adminName}
                    restaurantLogoUrl={restaurantLogoUrl}
                    restaurantName={restaurantName}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold text-foreground">
                      {adminName}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {adminEmail}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  <InfoRow
                    icon={<Store className="size-4" />}
                    label="Restaurant"
                    value={restaurantName}
                  />
                  <InfoRow
                    icon={<ShieldCheck className="size-4" />}
                    label="Workspace slug"
                    value={restaurantSlug}
                  />
                  <InfoRow
                    icon={<UserRound className="size-4" />}
                    label="Role"
                    value="Primary admin"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-9 items-center justify-center rounded-xl border bg-background">
                    <KeyRound className="size-4 text-muted-foreground" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Password and security
                    </p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Change the admin password used to sign into NapCart.
                    </p>
                  </div>
                </div>

                <form action={changeAdminPassword} className="mt-5 space-y-3">
                  <input name="redirectTo" type="hidden" value={pathname} />
                  <FieldLabel label="Current password">
                    <Input
                      name="currentPassword"
                      placeholder="Enter current password"
                      required
                      type="password"
                    />
                  </FieldLabel>
                  <FieldLabel label="New password">
                    <Input
                      name="newPassword"
                      placeholder="Enter new password"
                      required
                      type="password"
                    />
                  </FieldLabel>
                  <FieldLabel label="Confirm new password">
                    <Input
                      name="confirmPassword"
                      placeholder="Repeat new password"
                      required
                      type="password"
                    />
                  </FieldLabel>
                  <Button className="w-full" type="submit">
                    Update password
                  </Button>
                </form>
              </div>
            </div>

            <div className="border-t border-border bg-background px-6 py-4">
              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-sm font-semibold text-foreground">
                  Session
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Sign out from the current NapCart admin session after
                  confirming the action.
                </p>
                <Button
                  className="mt-4 w-full"
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    setOpen(false);
                    setConfirmSignOut(true);
                  }}
                >
                  <LogOut className="size-4" />
                  Sign out
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <SignOutConfirmation
        open={confirmSignOut}
        onClose={() => setConfirmSignOut(false)}
      />
    </>
  );
}

function FieldLabel({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5">
      <span className="text-muted-foreground">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

function AccountAvatar({
  adminName,
  restaurantLogoUrl,
  restaurantName,
  size = "default",
}: {
  adminName: string;
  restaurantLogoUrl: string | null;
  restaurantName: string;
  size?: "sm" | "default";
}) {
  const wrapperClassName = size === "sm" ? "size-8 rounded-full" : "size-10 rounded-xl";

  if (restaurantLogoUrl) {
    return (
      <Image
        alt={restaurantName}
        className={cn("shrink-0 object-cover", wrapperClassName)}
        height={size === "sm" ? 32 : 40}
        src={restaurantLogoUrl}
        width={size === "sm" ? 32 : 40}
      />
    );
  }

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center bg-muted font-semibold text-foreground",
        wrapperClassName,
      )}
    >
      {adminName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()}
    </span>
  );
}

function getTriggerClassName(variant: AdminAccountPanelProps["triggerVariant"]) {
  if (variant === "header") {
    return "flex size-8 items-center justify-center rounded-full border bg-card text-card-foreground shadow-xs transition hover:bg-muted";
  }

  if (variant === "sidebar-collapsed") {
    return "flex size-10 items-center justify-center rounded-xl border border-transparent bg-transparent text-white transition hover:bg-white/10 hover:text-white";
  }

  return "flex w-full items-center gap-3 rounded-xl p-2 text-left text-white transition hover:bg-white/10 hover:text-white [&_p:last-child]:text-white/65";
}

function SignOutConfirmation({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-3xl border border-border bg-background p-6 shadow-2xl">
        <p className="text-lg font-semibold text-foreground">
          Sign out of NapCart?
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          You will be returned to the login screen and will need to sign in
          again to manage this restaurant.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <form action={logoutFromAdmin}>
            <Button type="submit" variant="destructive">
              <LogOut className="size-4" />
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}
