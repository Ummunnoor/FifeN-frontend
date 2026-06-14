interface FieldErrorProps {
  message?: string;
  id?: string;
}

/** Inline, accessible validation message shown directly beneath a field. */
export function FieldError({ message, id }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-sm text-red-600">
      {message}
    </p>
  );
}
