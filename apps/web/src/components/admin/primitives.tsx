import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cx } from "@/lib/utils/cx";

export const buttonBaseClassName =
  "inline-flex min-h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

export function Surface({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cx(
        "rounded-[22px] border border-border/80 bg-card text-card-foreground shadow-[0_18px_60px_rgba(16,18,16,0.04)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function MetricCard({
  label,
  value,
  note,
  accent = "dark",
}: {
  label: string;
  value: string | number;
  note: string;
  accent?: "dark" | "lime" | "copper";
}) {
  const accentClassName =
    accent === "lime"
      ? "border-primary bg-[linear-gradient(135deg,#0c4b2d_0%,#0e6f43_100%)] text-primary-foreground"
      : accent === "copper"
        ? "bg-[#f6f3ee] text-foreground"
        : "bg-card";

  return (
    <div
      className={cx(
        "rounded-[18px] border border-border p-5 shadow-sm",
        accentClassName,
      )}
    >
      <p
        className={cx(
          "text-xs font-medium text-muted-foreground",
          accent === "lime" ? "text-white/70" : "text-muted-foreground",
        )}
      >
        {label}
      </p>
      <p className="mt-4 text-4xl font-semibold tracking-tight">{value}</p>
      <p
        className={cx(
          "mt-2 text-sm leading-6",
          accent === "lime" ? "text-white/75" : "text-muted-foreground",
        )}
      >
        {note}
      </p>
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">
          {eyebrow}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function Field({
  id,
  label,
  children,
  hint,
}: {
  id?: string;
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block space-y-2" htmlFor={id}>
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cx(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        props.className,
      )}
    />
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cx(
        "min-h-[112px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        props.className,
      )}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cx(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        props.className,
      )}
    />
  );
}

export function CheckboxRow({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string;
  label: string;
  description: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-start gap-3 rounded-lg border border-border bg-background px-4 py-3">
      <input
        className="mt-1 h-4 w-4 rounded border-input accent-primary"
        defaultChecked={defaultChecked}
        name={name}
        type="checkbox"
      />
      <span className="space-y-1">
        <span className="block text-sm font-medium text-foreground">{label}</span>
        <span className="block text-xs leading-5 text-muted-foreground">
          {description}
        </span>
      </span>
    </label>
  );
}

export function SubmitButton({
  children,
  tone = "dark",
}: {
  children: ReactNode;
  tone?: "dark" | "light";
}) {
  return (
    <button
      className={cx(
        buttonBaseClassName,
        tone === "dark"
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "border border-border bg-background text-foreground hover:bg-muted",
      )}
      type="submit"
    >
      {children}
    </button>
  );
}

export function StatusPill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "good" | "warning";
}) {
  const toneClassName =
    tone === "good"
      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
      : tone === "warning"
        ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
        : "bg-muted text-muted-foreground ring-1 ring-border";

  return (
    <span
      className={cx(
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium",
        toneClassName,
      )}
    >
      {children}
    </span>
  );
}

export function PageNotice({
  message,
  tone = "success",
}: {
  message: string;
  tone?: "success" | "error";
}) {
  return (
    <div
      className={cx(
        "rounded-[18px] border px-4 py-3 text-sm font-medium",
        tone === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-rose-200 bg-rose-50 text-rose-700",
      )}
    >
      {message}
    </div>
  );
}
