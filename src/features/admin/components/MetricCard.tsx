import type { ReactNode } from 'react';
import { Card } from '@/shared/components/Card';
import { cn } from '@/shared/lib/cn';

interface MetricCardProps {
  label: string;
  value: ReactNode;
  /** Highlight the north-star metric (cross-discovery rate). */
  emphasis?: boolean;
}

/** A single KPI tile on the admin dashboard. */
export function MetricCard({ label, value, emphasis }: MetricCardProps) {
  return (
    <Card className={cn('p-5', emphasis && 'border-accent-200 bg-accent-50')}>
      <p className="text-sm text-slate-600">{label}</p>
      <p className={cn('mt-2 text-2xl font-bold', emphasis ? 'text-accent-700' : 'text-slate-900')}>
        {value}
      </p>
    </Card>
  );
}
