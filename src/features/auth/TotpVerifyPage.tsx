import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Input } from '@/shared/components/Input';
import { useMutation } from '@/shared/hooks/useApi';
import { AuthService } from '@/features/auth/AuthService';
import { useAuthStore } from '@/shared/stores/authStore';

interface TotpLocationState {
  tempToken?: string;
  email?: string;
  next?: string | null;
}

export function TotpVerifyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as TotpLocationState | null;
  const setSession = useAuthStore((store) => store.setSession);
  const [code, setCode] = useState('');
  const [localError, setLocalError] = useState<string>();
  const verify = useMutation(AuthService.verifyTotp);

  if (!state) return <Navigate to="/login" replace />;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const cleanCode = code.replace(/\D/g, '').slice(0, 6);
    if (!/^\d{6}$/.test(cleanCode)) {
      setLocalError('Enter all 6 digits from your authenticator app.');
      return;
    }
    setLocalError(undefined);
    try {
      const session = await verify.run({ code: cleanCode, tempToken: state?.tempToken });
      setSession(session);
      navigate(session.user.isAdmin ? '/admin' : (state?.next ?? '/'), { replace: true });
    } catch {
      // The mutation exposes the normalized API error below.
    }
  }

  const fieldError = verify.error?.fieldError('code') ?? localError;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-accent-50 to-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-600 text-white">
            <ShieldCheckIcon className="h-6 w-6" />
          </span>
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">Verify it’s you</h1>
          <p className="mt-1 text-sm text-slate-600">Enter the 6-digit code from Google Authenticator</p>
          {state.email && <p className="mt-2 text-sm text-slate-500">Signing in as {state.email}</p>}
        </div>
        <Card className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <Input
              label="Authenticator code"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              error={fieldError}
            />
            {verify.error && !fieldError && <p role="alert" className="text-sm text-red-600">{verify.error.detail}</p>}
            <Button type="submit" fullWidth size="lg" isLoading={verify.isLoading}>Verify and sign in</Button>
            <button
              type="button"
              onClick={() => navigate(`/login${state.next ? `?next=${encodeURIComponent(state.next)}` : ''}`, { state: { email: state.email } })}
              className="inline-flex w-full items-center justify-center gap-2 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeftIcon className="h-4 w-4" /> Back to email verification
            </button>
          </form>
        </Card>
      </div>
    </main>
  );
}
