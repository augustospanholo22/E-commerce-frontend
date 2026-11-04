import { cn } from "@/lib/cn";

const control =
  "w-full rounded-xl border border-line-strong bg-surface px-4 text-[0.9375rem] text-fg placeholder:text-subtle " +
  "transition-[border-color,box-shadow] duration-200 outline-none " +
  "hover:border-subtle focus:border-brand focus:shadow-[0_0_0_4px_rgb(162_236_52/0.12)] " +
  "aria-[invalid=true]:border-danger disabled:bg-surface-2 disabled:text-muted [color-scheme:dark]";

type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  htmlFor: string;
  className?: string;
};

export function Field({ label, hint, error, children, htmlFor, className }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-[0.8125rem] font-medium text-fg-soft">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(control, "h-12", className)} {...props} />;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(control, "min-h-28 resize-y py-3 leading-relaxed", className)} {...props} />;
}

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        control,
        "h-11 appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 fill=%22none%22 stroke=%22%23b9b9b9%22 stroke-width=%221.5%22><path d=%22M2.5 4.5 6 8l3.5-3.5%22/></svg>')] bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pr-10 text-sm",
        className,
      )}
      {...props}
    />
  );
}
