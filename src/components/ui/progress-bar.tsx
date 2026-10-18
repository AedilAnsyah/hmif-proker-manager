import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  total: number;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({ value, total, className, showLabel = true }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex-1 h-1.5 bg-line rounded-sm overflow-hidden" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={total}>
        <div
          className="h-full bg-ink rounded-sm transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-mono font-medium text-ink-2 tabular-nums whitespace-nowrap">
          {value}/{total}
        </span>
      )}
    </div>
  );
}
