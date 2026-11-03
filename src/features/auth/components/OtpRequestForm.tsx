import { useState, type FormEvent } from 'react';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { Input } from '@/shared/components/Input';
import { Button } from '@/shared/components/Button';
import { useMutation } from '@/shared/hooks/useApi';
import { AuthService } from '@/features/auth/AuthService';

const EMAIL_ADDRESS = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface OtpRequestFormProps {
  onCodeSent: (email: string) => void;
}

/** Step 1 of login: collect an email address and request an OTP. */
export function OtpRequestForm({ onCodeSent }: OtpRequestFormProps) {
  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState<string>();
  const { run, isLoading, error } = useMutation(AuthService.requestOtp);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_ADDRESS.test(trimmed)) {
      setLocalError('Enter a valid email address.');
      return;
    }
    setLocalError(undefined);
    await run({ email: trimmed });
    onCodeSent(trimmed);
  }

  // Prefer a field-level error from the API, then our local rule, then a generic detail.
  const fieldError = error?.fieldError('email') ?? localError;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <Input
        label="Email"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fieldError}
        hint="We'll email you a 6-digit verification code."
      />
      {error && !fieldError && (
        <p role="alert" className="text-sm text-red-600">
          {error.detail}
        </p>
      )}
      <Button type="submit" fullWidth size="lg" isLoading={isLoading} leftIcon={<EnvelopeIcon className="h-5 w-5" />}>
        Send code
      </Button>
    </form>
  );
}
