import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Input } from '@/shared/components/Input';
import { Button } from '@/shared/components/Button';
import { useMutation } from '@/shared/hooks/useApi';
import { useAuthStore } from '@/shared/stores/authStore';
import { AuthService } from '@/features/auth/AuthService';

interface OtpVerifyFormProps {
  phoneNumber: string;
  onChangeNumber: () => void;
}

/**
 * Step 2 of login: verify the OTP. If the API replies "MFA required" (admins), the authenticator
 * field is revealed and the user resubmits with both codes — the OTP challenge is not consumed
 * on that first failure (PDR §1.3).
 */
export function OtpVerifyForm({ phoneNumber, onChangeNumber }: OtpVerifyFormProps) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const setSession = useAuthStore((s) => s.setSession);

  const [code, setCode] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [localError, setLocalError] = useState<string>();

  const { run, isLoading, error } = useMutation(AuthService.verifyOtp);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!/^\d{6}$/.test(code.trim())) {
      setLocalError('Enter the 6-digit code we sent you.');
      return;
    }
    setLocalError(undefined);

    try {
      const session = await run({
        phoneNumber,
        code: code.trim(),
        totpCode: mfaRequired ? totpCode.trim() : undefined,
      });
      setSession(session);
      navigate(params.get('next') ?? '/', { replace: true });
    } catch (err) {
      // "MFA required" → reveal the authenticator field and let the user resubmit.
      if (err && typeof err === 'object' && 'title' in err && err.title === 'MFA required') {
        setMfaRequired(true);
      }
    }
  }

  const codeError = error?.fieldError('code') ?? localError;
  const showGenericError = error && error.title !== 'MFA required' && !codeError;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <p className="text-sm text-slate-600">
        Code sent to <span className="font-medium text-slate-900">{phoneNumber}</span>.{' '}
        <button type="button" onClick={onChangeNumber} className="font-medium text-accent-600 hover:underline">
          Change
        </button>
      </p>

      <Input
        label="Verification code"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        placeholder="123456"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
        error={codeError}
      />

      {mfaRequired && (
        <Input
          label="Authenticator code"
          inputMode="numeric"
          maxLength={6}
          placeholder="6-digit code from your app"
          value={totpCode}
          onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
          error={error?.fieldError('totpCode')}
          hint="Your account has two-factor authentication enabled."
        />
      )}

      {mfaRequired && error?.title === 'MFA required' && (
        <p role="alert" className="text-sm text-amber-700">
          {error.detail}
        </p>
      )}
      {showGenericError && (
        <p role="alert" className="text-sm text-red-600">
          {error.detail}
        </p>
      )}

      <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
        {mfaRequired ? 'Verify & sign in' : 'Verify'}
      </Button>
    </form>
  );
}
