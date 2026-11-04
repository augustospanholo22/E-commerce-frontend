import { cn } from "@/lib/cn";

export type BadgeTone = "neutral" | "brand" | "danger" | "solid" | "outline";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-surface-2 text-fg-soft",
  brand: "bg-brand-soft text-brand",
  danger: "bg-danger-soft text-danger",
  solid: "bg-fg text-canvas",
  outline: "border border-line-strong text-fg-soft",
};

export function Badge({ tone = "neutral", dot, className, children }: { tone?: BadgeTone; dot?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", tones[tone], className)}>
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
