import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/** Skeleton loading placeholder — solid surface color, no shimmer */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("rounded-md bg-surface animate-pulse", className)}
      {...props}
    />
  );
}
