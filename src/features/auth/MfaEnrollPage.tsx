import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import { PageHeader } from '@/shared/components/PageHeader';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { useApi, useMutation } from '@/shared/hooks/useApi';
import { LoadingState, ErrorState } from '@/shared/components/StateViews';
import { AuthService } from '@/features/auth/AuthService';

/**
 * Admin TOTP enrollment (PDR §1.7). We surface the secret for manual entry rather than calling a
 * third-party QR service — the authenticator seed must never leave the user's device.
 * After activation the admin must sign in again so their token carries the `amr=mfa` claim.
 */
export function MfaEnrollPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setupToken = (location.state as { setupToken?: string } | null)?.setupToken;
  const email = (location.state as { email?: string } | null)?.email;
  const [code, setCode] = useState('');
  const [done, setDone] = useState(false);

  const { data, error, isLoading, reload } = useApi(() => AuthService.enrollMfa(setupToken), [setupToken]);
  const verify = useMutation(AuthService.verifyMfa);

  const secret = data ? new URL(data.otpAuthUri).searchParams.get('secret') : null;

  async function handleVerify(event: FormEvent) {
    event.preventDefault();
    if (!/^\d{6}$/.test(code.trim())) return;
    await verify.run(code.trim(), setupToken);
    setDone(true);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader title="Set up two-factor authentication" description="Required to access the admin area." />

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : done ? (
        <Card className="flex flex-col items-center gap-4 p-8 text-center">
          <ShieldCheckIcon className="h-10 w-10 text-accent-600" />
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Two-factor authentication is on</h2>
            <p className="mt-1 text-sm text-slate-600">
              Your authenticator is ready. Sign in again to complete admin access.
            </p>
          </div>
          <Button onClick={() => navigate('/login', { state: { email } })}>Sign in again</Button>
        </Card>
      ) : (
        <Card className="space-y-5 p-6">
          <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-600">
            <li>Open your authenticator app (Google Authenticator, Authy, 1Password…).</li>
            <li>Add a new account and enter the setup key below.</li>
            <li>Enter the 6-digit code it generates to confirm.</li>
          </ol>

          {secret && (
            <div className="rounded-xl bg-slate-50 p-4 text-center">
              <p className="text-xs uppercase tracking-wide text-slate-500">Setup key</p>
              <p className="mt-1 break-all font-mono text-sm font-medium text-slate-900">{secret}</p>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <Input
              label="Authenticator code"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              error={verify.error?.detail}
            />
            <Button type="submit" fullWidth isLoading={verify.isLoading}>
              Activate
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
