import type { ReactNode } from 'react';
import { ExclamationTriangleIcon, InboxIcon } from '@heroicons/react/24/outline';
import type { ApiError } from '@/shared/lib/apiError';
import { Button } from '@/shared/components/Button';
import { Spinner } from '@/shared/components/Spinner';

/** Centered loading state for full-section fetches. */
export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
      <Spinner className="h-7 w-7" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

/** Section-level error with an optional retry. Surfaces the API `detail` and traceId for support. */
export function ErrorState({ error, onRetry }: { error: ApiError; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-red-100 bg-red-50/60 py-12 text-center">
      <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
      <div>
        <p className="font-medium text-red-800">{error.title}</p>
        <p className="mt-1 text-sm text-red-700">{error.detail}</p>
        {error.traceId && <p className="mt-1 text-xs text-red-400">Ref: {error.traceId}</p>}
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

/** Friendly empty state for zero-result lists. */
export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-slate-500">
      <InboxIcon className="h-8 w-8 text-slate-300" />
      <p className="font-medium text-slate-700">{title}</p>
      {description && <p className="max-w-sm text-sm">{description}</p>}
      {action}
    </div>
  );
}
