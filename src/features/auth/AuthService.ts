import { api } from '@/shared/lib/api';
import type { Session } from '@/shared/stores/authStore';
import type { OtpRequestPayload, OtpVerifyPayload, OtpVerifyResponse, TotpVerifyPayload } from '@/features/auth/auth.types';

/**
 * Typed gateway for the email + OTP auth endpoints. Components call these — never axios.
 */
export const AuthService = {
  /** Sends a one-time passcode to an email address. */
  async requestOtp(payload: OtpRequestPayload): Promise<void> {
    await api.post('/auth/otp/request', payload);
  },

  /** Verifies the email code; admins may receive a temporary TOTP challenge. */
  async verifyOtp(payload: OtpVerifyPayload): Promise<OtpVerifyResponse> {
    const { data } = await api.post<OtpVerifyResponse>('/auth/otp/verify', payload);
    return data;
  },

  /** Completes an admin sign-in using its short-lived challenge token. */
  async verifyTotp(payload: TotpVerifyPayload): Promise<Session> {
    const { data } = await api.post<Session>(
      '/auth/mfa/login/verify',
      { code: payload.code },
      { headers: { Authorization: `Bearer ${payload.tempToken}` } },
    );
    return data;
  },

  /** Revokes the refresh token server-side. */
  async logout(refreshToken: string): Promise<void> {
    await api.post('/auth/logout', { refreshToken });
  },

  /** Begins admin TOTP enrollment; returns the otpauth URI to render as a QR code (PDR §1.7). */
  async enrollMfa(setupToken?: string): Promise<{ otpAuthUri: string }> {
    const { data } = await api.post<{ otpAuthUri: string }>(
      '/auth/mfa/enroll',
      undefined,
      setupToken ? { headers: { Authorization: `Bearer ${setupToken}` } } : undefined,
    );
    return data;
  },

  /** Activates MFA after confirming a code from the authenticator app. */
  async verifyMfa(code: string, setupToken?: string): Promise<void> {
    await api.post(
      '/auth/mfa/verify',
      { code },
      setupToken ? { headers: { Authorization: `Bearer ${setupToken}` } } : undefined,
    );
  },
};
