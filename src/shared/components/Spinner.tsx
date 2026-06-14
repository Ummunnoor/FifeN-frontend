import { cn } from '@/shared/lib/cn';

interface SpinnerProps {
  /** Tailwind size classes, e.g. "h-5 w-5". Defaults to a medium spinner. */
  className?: string;
  label?: string;
}

/** An accessible, accent-coloured loading spinner. */
export function Spinner({ className, label = 'Loading' }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        'inline-block animate-spin rounded-full border-2 border-current border-t-transparent text-accent-600',
        className ?? 'h-5 w-5',
      )}
    />
  );
}
