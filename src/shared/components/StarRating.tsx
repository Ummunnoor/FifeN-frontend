import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { cn } from '@/shared/lib/cn';

interface StarRatingProps {
  /** Current value, 1–5 (may be fractional for display). */
  value: number;
  /** When provided, the stars become an interactive picker. */
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-7 w-7' } as const;

/** Read-only or interactive 5-star rating. */
export function StarRating({ value, onChange, size = 'md', className }: StarRatingProps) {
  const interactive = !!onChange;

  return (
    <div className={cn('inline-flex items-center gap-0.5', className)} role={interactive ? 'radiogroup' : 'img'} aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(value);
        const Icon = filled ? StarSolid : StarOutline;
        const star_ = (
          <Icon className={cn(SIZES[size], filled ? 'text-amber-400' : 'text-slate-300')} />
        );
        return interactive ? (
          <button
            key={star}
            type="button"
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            aria-checked={star === Math.round(value)}
            role="radio"
            onClick={() => onChange(star)}
            className="rounded p-0.5 transition-transform hover:scale-110"
          >
            {star_}
          </button>
        ) : (
          <span key={star}>{star_}</span>
        );
      })}
    </div>
  );
}
