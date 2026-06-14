import { useState } from 'react';
import { Card } from '@/shared/components/Card';
import { OtpRequestForm } from '@/features/auth/components/OtpRequestForm';
import { OtpVerifyForm } from '@/features/auth/components/OtpVerifyForm';

/** Two-step phone + OTP sign-in. Account is created on first verify (PDR §2.1). */
export function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-accent-50 to-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-600 text-xl font-bold text-white">
            TN
          </span>
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">Welcome to TradeNaija</h1>
          <p className="mt-1 text-sm text-slate-600">
            {phoneNumber ? 'Enter the code to continue' : 'Sign in or create an account with your phone'}
          </p>
        </div>

        <Card className="p-6 sm:p-8">
          {phoneNumber ? (
            <OtpVerifyForm phoneNumber={phoneNumber} onChangeNumber={() => setPhoneNumber(null)} />
          ) : (
            <OtpRequestForm onCodeSent={setPhoneNumber} />
          )}
        </Card>

        <p className="mt-6 text-center text-xs text-slate-500">
          By continuing you agree to TradeNaija's Terms and Privacy Policy.
        </p>
      </div>
    </main>
  );
}
