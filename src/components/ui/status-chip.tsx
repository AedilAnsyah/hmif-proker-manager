import { cn } from "@/lib/utils";
import { Circle, CircleDot, CheckCircle2 } from "lucide-react";

export type TaskStatusValue = "belum_dimulai" | "on_progress" | "selesai";

interface StatusChipProps {
  status: TaskStatusValue;
  className?: string;
  /** If true, renders as a button (for those with permission to change status) */
  interactive?: boolean;
  onClick?: () => void;
}

const statusConfig: Record<
  TaskStatusValue,
  { label: string; icon: React.ComponentType<{ className?: string }>; style: string }
> = {
  belum_dimulai: {
    label: "Belum Dimulai",
    icon: Circle,
    style: "border border-line-strong bg-bg text-ink",
  },
  on_progress: {
    label: "On Progress",
    icon: CircleDot,
    style: "bg-accent text-on-accent",
  },
  selesai: {
    label: "Selesai",
    icon: CheckCircle2,
    style: "bg-ink text-white",
  },
};

export function StatusChip({ status, className, interactive, onClick }: StatusChipProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const baseClasses = cn(
    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
    "transition-colors duration-150",
    config.style,
    interactive && "cursor-pointer hover:opacity-90",
    className
  );

  if (interactive) {
    return (
      <button type="button" className={baseClasses} onClick={onClick}>
        <Icon className="h-3.5 w-3.5" />
        {config.label}
      </button>
    );
  }

  return (
    <span className={baseClasses}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}
