import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';
import { FieldError } from '@/shared/components/FieldError';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

/** Labelled text input with rounded borders, accent focus ring, and inline error binding. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, id, className, ...rest },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'h-11 w-full rounded-xl border bg-white px-3.5 text-slate-900 placeholder:text-slate-400',
          'transition-colors',
          error
            ? 'border-red-400 focus:border-red-500'
            : 'border-slate-300 focus:border-accent-500',
          className,
        )}
        {...rest}
      />
      {hint && !error && <p className="mt-1.5 text-sm text-slate-500">{hint}</p>}
      <FieldError id={errorId} message={error} />
    </div>
  );
});
