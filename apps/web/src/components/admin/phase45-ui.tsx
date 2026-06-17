import Image from "next/image";
import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  ImageIcon,
  MoreVertical,
  Pencil,
  Plus,
  Send,
  Store,
  Trash2,
  UploadCloud,
  X,
  type LucideIcon,
} from "lucide-react";
import { cx } from "@/lib/utils/cx";

export function formatAdminMoney(value: unknown, currency = "PKR") {
  return new Intl.NumberFormat("en-PK", {
    currency,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
    style: "currency",
  })
    .format(Number(value ?? 0))
    .replace("PKR", "PKR ");
}

export function formatAdminDecimal(value: unknown) {
  return Number(value ?? 0).toLocaleString("en-PK", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
}

export function AdminWorkspace({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main
      className={cx(
        "min-w-0 min-h-[calc(100svh-32px)] rounded-[24px] border border-[#e7e7e3] bg-white p-6 shadow-[0_22px_70px_rgba(16,18,16,0.06)] md:p-8",
        className,
      )}
    >
      {children}
    </main>
  );
}

export function PageTitle({
  title,
  description,
  action,
  meta,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
      <div>
        <h1 className="text-[34px] leading-tight font-semibold tracking-normal text-[#111111]">
          {title}
        </h1>
        <p className="mt-2 text-[15px] leading-6 text-[#767676]">
          {description}
        </p>
      </div>
      {(action ?? meta) ? (
        <div className="flex shrink-0 items-center gap-4">
          {meta}
          {action}
        </div>
      ) : null}
    </div>
  );
}

export function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cx(
        "rounded-[18px] border border-[#e5e5e1] bg-white shadow-[0_14px_45px_rgba(16,18,16,0.035)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function PanelHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold tracking-normal text-[#111111]">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-[#777]">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function PrimaryButton({
  children,
  href,
  className,
  type = "button",
}: {
  children: ReactNode;
  href?: string;
  className?: string;
  type?: "button" | "submit";
}) {
  const classes = cx(
    "inline-flex h-12 items-center justify-center gap-2 rounded-[10px] bg-[var(--admin-primary)] px-5 text-sm font-semibold !text-white shadow-[0_14px_28px_rgba(100,43,147,0.22)] transition hover:bg-[var(--admin-primary-dark)] [&_svg]:!text-white",
    className,
  );

  if (href) {
    return (
      <Link className={classes} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} type={type}>
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  className,
  type = "button",
}: {
  children: ReactNode;
  className?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      className={cx(
        "inline-flex h-12 items-center justify-center gap-2 rounded-[10px] border border-[#deded8] bg-white px-5 text-sm font-semibold text-[#111] transition hover:bg-[#f6f6f3]",
        className,
      )}
      type={type}
    >
      {children}
    </button>
  );
}

export function IconButton({
  icon: Icon,
  label,
  className,
  type = "button",
}: {
  icon: LucideIcon;
  label: string;
  className?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      aria-label={label}
      className={cx(
        "inline-flex size-10 items-center justify-center rounded-[10px] border border-[#deded8] bg-white text-[#1f1f1f] transition hover:bg-[#f6f6f3]",
        className,
      )}
      type={type}
    >
      <Icon className="size-4" />
    </button>
  );
}

export function IconBubble({
  icon: Icon,
  tone = "green",
  className,
}: {
  icon: LucideIcon;
  tone?: "green" | "yellow" | "gray" | "dark";
  className?: string;
}) {
  const tones = {
    dark: "bg-[var(--admin-primary)] !text-white",
    gray: "bg-[#f1f1ef] text-[#111]",
    green: "bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]",
    yellow: "bg-[var(--admin-accent-soft)] text-[var(--admin-accent)]",
  };

  return (
    <span
      className={cx(
        "inline-flex size-14 shrink-0 items-center justify-center rounded-full",
        tones[tone],
        className,
      )}
    >
      <Icon className="size-6" />
    </span>
  );
}

export function StatCard({
  icon,
  label,
  value,
  note,
  action,
  tone = "green",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  note: string;
  action?: ReactNode;
  tone?: "green" | "yellow" | "gray";
}) {
  return (
    <Panel className="flex min-h-[124px] flex-col justify-between p-4 sm:p-5">
      <div className="flex min-w-0 flex-col">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <p className="min-w-0 pt-1 text-sm font-medium text-[#222]">
            {label}
          </p>
          <IconBubble
            className="size-10 2xl:size-14 [&_svg]:size-5 2xl:[&_svg]:size-6"
            icon={icon}
            tone={tone}
          />
        </div>
        <p className="mt-3 min-w-0 text-[clamp(1.45rem,2vw,2.25rem)] leading-none font-semibold tracking-tight whitespace-nowrap text-[#111]">
          {value}
        </p>
        <p className="mt-3 text-xs leading-4 text-[#777] 2xl:text-sm 2xl:leading-5">
          {note}
        </p>
      </div>
      {action ? <div className="mt-5">{action}</div> : null}
    </Panel>
  );
}

export function StatusBadge({
  children,
  tone = "green",
  dot = false,
}: {
  children: ReactNode;
  tone?: "green" | "gray" | "yellow" | "red";
  dot?: boolean;
}) {
  const tones = {
    gray: "bg-[#f1f1ef] text-[#555]",
    green: "bg-[#ddf5e7] text-[#23834b]",
    red: "bg-[#fee5e7] text-[#c73645]",
    yellow: "bg-[#fff0c8] text-[#b27800]",
  };

  return (
    <span
      className={cx(
        "inline-flex w-fit max-w-max items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap",
        tones[tone],
      )}
    >
      {dot ? (
        <span
          className={cx(
            "size-1.5 rounded-full",
            tone === "green"
              ? "bg-[#23834b]"
              : tone === "yellow"
                ? "bg-[#b27800]"
                : tone === "red"
                  ? "bg-[#c73645]"
                  : "bg-[#777]",
          )}
        />
      ) : null}
      {children}
    </span>
  );
}

export function FormInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cx(
        "h-12 w-full rounded-[10px] border border-[#deded8] bg-white px-4 text-sm text-[#111] transition outline-none placeholder:text-[#a7a7a1] focus:border-[var(--admin-primary)] focus:ring-4 focus:ring-[rgba(100,43,147,0.10)]",
        className,
      )}
    />
  );
}

export function FormTextarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cx(
        "min-h-28 w-full rounded-[10px] border border-[#deded8] bg-white px-4 py-3 text-sm text-[#111] transition outline-none placeholder:text-[#a7a7a1] focus:border-[var(--admin-primary)] focus:ring-4 focus:ring-[rgba(100,43,147,0.10)]",
        className,
      )}
    />
  );
}

export function FormSelect({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        {...props}
        className={cx(
          "h-12 w-full appearance-none rounded-[10px] border border-[#deded8] bg-white px-4 pr-10 text-sm text-[#111] transition outline-none focus:border-[var(--admin-primary)] focus:ring-4 focus:ring-[rgba(100,43,147,0.10)]",
          className,
        )}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-[#777]" />
    </div>
  );
}

export function FormField({
  label,
  hint,
  children,
}: {
  label: ReactNode;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[#161616]">
        {label}
      </span>
      {children}
      {hint ? (
        <span className="mt-2 block text-xs text-[#777]">{hint}</span>
      ) : null}
    </label>
  );
}

export function ToggleVisual({ checked = false }: { checked?: boolean }) {
  return (
    <span
      className={cx(
        "relative inline-flex h-7 w-12 shrink-0 rounded-full transition",
        checked ? "bg-[#239b53]" : "bg-[#ddddda]",
      )}
    >
      <span
        className={cx(
          "absolute top-1 size-5 rounded-full bg-white shadow-sm transition",
          checked ? "left-6" : "left-1",
        )}
      />
    </span>
  );
}

export function ToggleInput({
  name,
  defaultChecked,
}: {
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center">
      <input
        className="peer sr-only"
        defaultChecked={defaultChecked}
        name={name}
        type="checkbox"
      />
      <span className="relative inline-flex h-7 w-12 rounded-full bg-[#ddddda] transition peer-checked:bg-[#239b53] peer-checked:[&>span]:left-6">
        <span className="absolute top-1 left-1 size-5 rounded-full bg-white shadow-sm transition" />
      </span>
    </label>
  );
}

export function SettingToggleRow({
  icon,
  title,
  description,
  name,
  defaultChecked,
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
  name: string;
  defaultChecked?: boolean;
}) {
  const Icon = icon;
  return (
    <div className="flex items-center gap-4 rounded-[12px] border border-[#e5e5e1] bg-white p-4">
      {Icon ? (
        <span className="flex size-10 items-center justify-center rounded-[10px] bg-[#f1f1ef]">
          <Icon className="size-5" />
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#111]">{title}</p>
        <p className="mt-1 text-xs leading-5 text-[#777]">{description}</p>
      </div>
      <ToggleInput defaultChecked={defaultChecked} name={name} />
    </div>
  );
}

export function SearchBox({
  placeholder,
  className,
  defaultValue,
  name = "q",
}: {
  placeholder: string;
  className?: string;
  defaultValue?: string;
  name?: string;
}) {
  return (
    <div className={cx("relative", className)}>
      <FormInput
        className="pl-11"
        defaultValue={defaultValue}
        name={name}
        placeholder={placeholder}
      />
      <svg
        aria-hidden="true"
        className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[#777]"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          d="m21 21-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

export function ProductThumb({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-[#f1f1ef]",
        className,
      )}
    >
      {src ? (
        <Image alt={alt} className="object-cover" fill sizes="96px" src={src} />
      ) : (
        <ImageIcon className="size-6 text-[#777]" />
      )}
    </div>
  );
}

export function UploadBox({
  label = "Upload image",
  note = "PNG, JPG up to 5MB",
  name = "image",
}: {
  label?: string;
  note?: string;
  name?: string;
}) {
  return (
    <label className="flex min-h-[170px] cursor-pointer flex-col items-center justify-center rounded-[12px] border border-dashed border-[#d7d7d1] bg-white p-5 text-center transition hover:bg-[#f8f8f5]">
      <UploadCloud className="size-9 text-[#676767]" />
      <span className="mt-3 text-sm font-semibold text-[#111]">{label}</span>
      <span className="mt-1 text-xs text-[#777]">{note}</span>
      <input accept="image/*" className="sr-only" name={name} type="file" />
    </label>
  );
}

export function Stepper({ activeStep }: { activeStep: 1 | 2 | 3 | 4 }) {
  const steps = [
    ["Basics", "Add key information"],
    ["Availability", "Choose branches"],
    ["Variations & Add-ons", "Set options & extras"],
    ["Review & Publish", "Confirm and publish"],
  ] as const;

  return (
    <div className="border-y border-[#e7e7e3] py-5">
      <div className="grid gap-4 md:grid-cols-4">
        {steps.map(([title, subtitle], index) => {
          const step = (index + 1) as 1 | 2 | 3 | 4;
          const isActive = step === activeStep;
          const isComplete = step < activeStep;

          return (
            <div className="relative pb-4" key={title}>
              <div className="flex items-start gap-4">
                <span
                  className={cx(
                    "flex size-10 items-center justify-center rounded-full text-sm font-semibold",
                    isActive
                      ? "bg-[var(--admin-primary)] !text-white"
                      : isComplete
                        ? "bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]"
                        : "bg-[#eeeeeb] text-[#333]",
                  )}
                >
                  {isComplete ? <Check className="size-5" /> : step}
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#111]">{title}</p>
                  <p className="mt-1 text-sm text-[#777]">{subtitle}</p>
                </div>
              </div>
              {isActive ? (
                <span className="absolute bottom-0 left-0 h-[3px] w-full rounded-full bg-[var(--admin-primary)]" />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ProductPreviewCard({
  title = "Product name",
  category = "Category",
  price = "PKR 0",
  description = "Product description will appear here.",
  imageUrl,
  children,
}: {
  title?: string;
  category?: string;
  price?: string;
  description?: string;
  imageUrl?: string | null;
  children?: ReactNode;
}) {
  return (
    <Panel className="p-6">
      <PanelHeader title="Live preview" />
      <div className="mt-7 flex gap-5">
        <ProductThumb alt={title} className="size-28" src={imageUrl} />
        <div className="min-w-0">
          <p className="font-semibold text-[#111]">{title}</p>
          <p className="mt-1 text-sm text-[#777]">{category}</p>
          <div className="mt-5">
            <StatusBadge tone="green">Available</StatusBadge>
          </div>
        </div>
      </div>
      <div className="mt-7 border-t border-[#e7e7e3] pt-6">
        <p className="text-lg font-semibold text-[#111]">{price}</p>
        <p className="mt-3 text-sm leading-6 text-[#777]">{description}</p>
      </div>
      {children}
    </Panel>
  );
}

export function ActionTile({
  icon: Icon,
  title,
  description,
  href,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      className="flex min-h-[74px] items-center gap-4 rounded-[12px] border border-[#deded8] bg-white p-4 transition hover:border-[var(--admin-primary)] hover:bg-[var(--admin-primary-softer)]"
      href={href}
    >
      <Icon className="size-6 shrink-0 text-[#111]" />
      <span>
        <span className="block text-sm font-semibold text-[#111]">{title}</span>
        <span className="mt-1 block text-xs text-[#777]">{description}</span>
      </span>
    </Link>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[14px] border border-dashed border-[#d7d7d1] bg-[#fafaf8] p-8 text-center">
      <p className="font-semibold text-[#111]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[#777]">{description}</p>
    </div>
  );
}

export function BranchIcon({
  className,
  tone = "gray",
}: {
  className?: string;
  tone?: "green" | "gray";
}) {
  return <IconBubble className={className} icon={Store} tone={tone} />;
}

export const CommonIcons = {
  ArrowRight,
  Check,
  ChevronRight,
  MoreVertical,
  Pencil,
  Plus,
  Send,
  Store,
  Trash2,
  X,
};

export type IconComponent = ComponentType<{ className?: string }>;
