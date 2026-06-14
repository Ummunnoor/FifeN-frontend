import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';
import { FieldError } from '@/shared/components/FieldError';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

/** Labelled multi-line input matching {@link Input}'s styling. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, id, className, ...rest },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={fieldId} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={fieldId}
        aria-invalid={!!error}
        className={cn(
          'w-full rounded-xl border bg-white px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400',
          'transition-colors',
          error ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-accent-500',
          className,
        )}
        {...rest}
      />
      {hint && !error && <p className="mt-1.5 text-sm text-slate-500">{hint}</p>}
      <FieldError message={error} />
    </div>
  );
});
