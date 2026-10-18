import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "./button";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: ButtonProps["variant"];
  };
  className?: string;
}

/**
 * Empty state — no illustrations, just title + description + action button.
 * Always shows the next step the user should take.
 */
export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-ink-2 max-w-sm">{description}</p>
      )}
      {action && (
        <Button
          variant={action.variant ?? "primary"}
          size="sm"
          className="mt-4"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
