"use client";

import type { ReactNode } from "react";

export function ConfirmSubmitButton({
  children,
  className,
  confirmMessage,
  label,
}: {
  children: ReactNode;
  className?: string;
  confirmMessage: string;
  label: string;
}) {
  return (
    <button
      aria-label={label}
      className={className}
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
      type="submit"
    >
      {children}
    </button>
  );
}
