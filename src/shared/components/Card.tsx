import type { HTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

/** Surface container with the shared rounded radius and a subtle border. */
export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-card border border-slate-200 bg-white shadow-sm', className)}
      {...rest}
    />
  );
}
