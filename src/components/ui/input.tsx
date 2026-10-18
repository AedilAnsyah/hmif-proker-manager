import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, helperText, id, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          id={id}
          className={cn(
            "flex h-11 w-full rounded-md border bg-bg px-3 py-2 text-sm text-ink",
            "placeholder:text-ink-3",
            "focus-visible:outline-none focus-visible:border-ink focus-visible:ring-1 focus-visible:ring-ink",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface",
            "transition-colors duration-150",
            error ? "border-danger" : "border-line",
            className
          )}
          ref={ref}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={
            error ? `${id}-error` : helperText ? `${id}-helper` : undefined
          }
          {...props}
        />
        {error && (
          <p id={`${id}-error`} className="mt-1 text-sm text-danger" role="alert" aria-live="polite">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${id}-helper`} className="mt-1 text-sm text-ink-3">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

const Label = React.forwardRef<
  React.ComponentRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & { required?: boolean }
>(({ className, children, required, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn("block text-sm font-medium text-ink mb-1.5", className)}
    {...props}
  >
    {children}
    {required && <span className="text-danger ml-0.5">*</span>}
  </LabelPrimitive.Root>
));
Label.displayName = "Label";

export { Input, Label };
