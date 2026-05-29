import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cx } from "@/lib/utils/cx";

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
        "rounded-[2rem] border border-black/5 bg-white/84 shadow-[0_28px_100px_rgba(15,23,32,0.06)] backdrop-blur",
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
      ? "bg-[linear-gradient(135deg,#19301f_0%,#244d2c_55%,#315f36_100%)] text-white"
      : accent === "copper"
        ? "bg-[linear-gradient(135deg,#f4ecdf_0%,#fff8ef_100%)]"
        : "bg-white";

  return (
    <div
      className={cx(
        "rounded-[1.7rem] border border-black/5 p-5 shadow-[0_18px_40px_rgba(15,23,32,0.04)]",
        accentClassName,
      )}
    >
      <p
        className={cx(
          "text-xs font-semibold tracking-[0.22em] uppercase",
          accent === "lime" ? "text-white/60" : "text-slate-500",
        )}
      >
        {label}
      </p>
      <p className="mt-4 text-4xl font-semibold tracking-tight">{value}</p>
      <p
        className={cx(
          "mt-3 text-sm leading-6",
          accent === "lime" ? "text-white/72" : "text-slate-600",
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
        <p className="text-xs font-semibold tracking-[0.24em] text-slate-500 uppercase">
          {eyebrow}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          {title}
        </h1>
        <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
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
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-slate-400">{hint}</span> : null}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cx(
        "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#1f3f2a]",
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
        "min-h-[112px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#1f3f2a]",
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
        "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-[#1f3f2a]",
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
    <label className="flex items-start gap-3 rounded-[1.3rem] border border-slate-200 bg-white px-4 py-3">
      <input
        className="mt-1 h-4 w-4 rounded border-slate-300 text-[#1f4d2f]"
        defaultChecked={defaultChecked}
        name={name}
        type="checkbox"
      />
      <span className="space-y-1">
        <span className="block text-sm font-semibold text-slate-900">{label}</span>
        <span className="block text-xs leading-5 text-slate-500">
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
        "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition",
        tone === "dark"
          ? "bg-[#101a20] text-white hover:bg-[#17262f]"
          : "border border-slate-200 bg-white text-slate-950 hover:bg-slate-50",
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
      ? "bg-emerald-100 text-emerald-900"
      : tone === "warning"
        ? "bg-amber-100 text-amber-900"
        : "bg-slate-100 text-slate-600";

  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase",
        toneClassName,
      )}
    >
      {children}
    </span>
  );
}
