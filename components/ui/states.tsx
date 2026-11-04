import { cn } from "@/lib/cn";

type StateProps = {
  icon?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  tone?: "neutral" | "error";
};

/** Estado vazio ou de erro com o mesmo visual em todo o site. */
export function StatePanel({ icon, title, description, action, className, tone = "neutral" }: StateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-[var(--radius-card)] border border-dashed px-6 py-14 text-center sm:py-20",
        tone === "error" ? "border-danger/30 bg-danger-soft/40" : "border-line-strong bg-surface/60",
        className,
      )}
    >
      {icon && (
        <div
          className={cn(
            "mb-5 flex size-12 items-center justify-center rounded-full",
            tone === "error" ? "bg-danger-soft text-danger" : "bg-surface-2 text-fg-soft",
          )}
        >
          {icon}
        </div>
      )}
      <h3 className="font-display text-2xl text-fg">{title}</h3>
      {description && <div className="mt-2 max-w-md text-sm leading-relaxed text-muted">{description}</div>}
      {action && <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("skeleton", className)} />;
}

export function Alert({ tone = "error", children, className }: { tone?: "error" | "info" | "success"; children: React.ReactNode; className?: string }) {
  const tones = {
    error: "border-danger/25 bg-danger-soft text-danger",
    info: "border-line-strong bg-surface-2 text-fg-soft",
    success: "border-brand/25 bg-brand-soft text-brand",
  };
  return (
    <div role={tone === "error" ? "alert" : "status"} className={cn("rounded-xl border px-4 py-3 text-sm leading-relaxed", tones[tone], className)}>
      {children}
    </div>
  );
}
