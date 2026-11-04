"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  value: number;
  max: number;
  onChange: (v: number) => void;
  size?: "sm" | "md";
  className?: string;
};

export function QuantityStepper({ value, max, onChange, size = "md", className }: Props) {
  const h = size === "sm" ? "h-9" : "h-12";
  const w = size === "sm" ? "w-9" : "w-11";
  return (
    <div className={cn("inline-flex items-center rounded-lg border border-line-strong bg-surface", h, className)}>
      <button
        type="button"
        aria-label="Diminuir quantidade"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        className={cn("flex h-full items-center justify-center rounded-l-lg text-fg-soft hover:text-fg disabled:opacity-30", w)}
      >
        <Minus className="size-3.5" strokeWidth={1.75} />
      </button>
      <span className={cn("tabular min-w-6 text-center font-medium", size === "sm" ? "text-sm" : "text-[0.9375rem]")} aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        aria-label="Aumentar quantidade"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={cn("flex h-full items-center justify-center rounded-r-lg text-fg-soft hover:text-fg disabled:opacity-30", w)}
      >
        <Plus className="size-3.5" strokeWidth={1.75} />
      </button>
    </div>
  );
}
