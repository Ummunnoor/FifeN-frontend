import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Input } from '@/shared/components/Input';
import { Button } from '@/shared/components/Button';
import { useMutation } from '@/shared/hooks/useApi';
import { useAuthStore, type Session } from '@/shared/stores/authStore';
import { AuthService } from '@/features/auth/AuthService';

interface OtpVerifyFormProps {
  email: string;
  onChangeEmail: () => void;
}

export function OtpVerifyForm({ email, onChangeEmail }: OtpVerifyFormProps) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const setSession = useAuthStore((s) => s.setSession);
  const [code, setCode] = useState('');
  const [localError, setLocalError] = useState<string>();
  const { run, isLoading, error } = useMutation(AuthService.verifyOtp);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const cleanCode = code.replace(/\D/g, '').slice(0, 6);
    if (!/^\d{6}$/.test(cleanCode)) {
      setLocalError('Enter the 6-digit code we sent you.');
      return;
    }
    setLocalError(undefined);

    try {
      const result = await run({ email, code: cleanCode });
      if (result.mfaEnrollmentRequired) {
        const setupToken = result.mfaSetupToken;
        if (!setupToken) {
          throw new Error('The server did not provide an MFA setup token. Please try again.');
        }
        navigate('/login/mfa-enroll', {
          state: { setupToken, email, next: params.get('next') },
        });
        return;
      }
      if (result.mfaVerificationRequired || result.requiresTotp) {
        const challengeToken = result.mfaChallengeToken ?? result.tempToken;
        if (!challengeToken) {
          throw new Error('The server did not provide an MFA challenge token. Please try again.');
        }
        navigate('/login/totp', {
          state: { tempToken: challengeToken, email, next: params.get('next') },
        });
        return;
      }
      if (!result.accessToken || !result.refreshToken || !result.expiresAtUtc || !result.user) {
        throw new Error('The server returned an incomplete sign-in session. Please try again.');
      }
      const session: Session = {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresAtUtc: result.expiresAtUtc,
        user: result.user,
      };
      setSession(session);
      navigate(session.user.isAdmin ? '/admin' : (params.get('next') ?? '/'), { replace: true });
    } catch (err) {
      if (err instanceof Error && !(err && typeof err === 'object' && 'status' in err)) {
        setLocalError(err.message);
      }
    }
  }

  const codeError = error?.fieldError('code') ?? localError;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <p className="text-sm text-slate-600">
        Code sent to <span className="font-medium text-slate-900">{email}</span>.{' '}
        <button type="button" onClick={onChangeEmail} className="font-medium text-accent-600 hover:underline">
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
        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        error={codeError}
      />
      {error && !codeError && <p role="alert" className="text-sm text-red-600">{error.detail}</p>}
      <Button type="submit" fullWidth size="lg" isLoading={isLoading}>Verify</Button>
    </form>
  );
}
