import { useState } from 'react';
import { Card } from '@/shared/components/Card';
import { OtpRequestForm } from '@/features/auth/components/OtpRequestForm';
import { OtpVerifyForm } from '@/features/auth/components/OtpVerifyForm';

/** Two-step email + OTP sign-in. */
export function LoginPage() {
  const [email, setEmail] = useState<string | null>(null);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-accent-50 to-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-600 text-xl font-bold text-white">
            TN
          </span>
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">Welcome to Trade9ja</h1>
          <p className="mt-1 text-sm text-slate-600">
            {email ? 'Enter the code to continue' : 'Sign in or create an account with your email'}
          </p>
        </div>

        <Card className="p-6 sm:p-8">
          {email ? (
            <OtpVerifyForm email={email} onChangeEmail={() => setEmail(null)} />
          ) : (
            <OtpRequestForm onCodeSent={setEmail} />
          )}
        </Card>

        <p className="mt-6 text-center text-xs text-slate-500">
          By continuing you agree to Trade9ja's Terms and Privacy Policy.
        </p>
      </div>
    </main>
  );
}
