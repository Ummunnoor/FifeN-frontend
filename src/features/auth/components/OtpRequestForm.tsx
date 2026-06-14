import { useState, type FormEvent } from 'react';
import { DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import { Input } from '@/shared/components/Input';
import { Button } from '@/shared/components/Button';
import { useMutation } from '@/shared/hooks/useApi';
import { AuthService } from '@/features/auth/AuthService';

const NIGERIAN_PHONE = /^(?:\+?234|0)[789]\d{9}$/;

interface OtpRequestFormProps {
  onCodeSent: (phoneNumber: string) => void;
}

/** Step 1 of login: collect and validate a Nigerian phone number, then request an OTP. */
export function OtpRequestForm({ onCodeSent }: OtpRequestFormProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [localError, setLocalError] = useState<string>();
  const { run, isLoading, error } = useMutation(AuthService.requestOtp);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = phoneNumber.trim();
    if (!NIGERIAN_PHONE.test(trimmed.replace(/\s/g, ''))) {
      setLocalError('Enter a valid Nigerian mobile number (e.g. 0801 234 5678).');
      return;
    }
    setLocalError(undefined);
    await run({ phoneNumber: trimmed });
    onCodeSent(trimmed);
  }

  // Prefer a field-level error from the API, then our local rule, then a generic detail.
  const fieldError = error?.fieldError('phoneNumber') ?? localError;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <Input
        label="Phone number"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="0801 234 5678"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        error={fieldError}
        hint="We'll send a 6-digit code to this number."
      />
      {error && !fieldError && (
        <p role="alert" className="text-sm text-red-600">
          {error.detail}
        </p>
      )}
      <Button type="submit" fullWidth size="lg" isLoading={isLoading} leftIcon={<DevicePhoneMobileIcon className="h-5 w-5" />}>
        Send code
      </Button>
    </form>
  );
}
