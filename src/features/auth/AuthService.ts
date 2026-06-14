import { api } from '@/shared/lib/api';
import type { Session } from '@/shared/stores/authStore';
import type { OtpRequestPayload, OtpVerifyPayload } from '@/features/auth/auth.types';

/**
 * Typed gateway for the phone + OTP auth endpoints (PDR §1). Components call these — never axios.
 */
export const AuthService = {
  /** Sends a one-time passcode to a Nigerian number. */
  async requestOtp(payload: OtpRequestPayload): Promise<void> {
    await api.post('/auth/otp/request', payload);
  },

  /** Verifies the code (and TOTP for admins), returning the authenticated session. */
  async verifyOtp(payload: OtpVerifyPayload): Promise<Session> {
    const { data } = await api.post<Session>('/auth/otp/verify', payload);
    return data;
  },

  /** Revokes the refresh token server-side. */
  async logout(refreshToken: string): Promise<void> {
    await api.post('/auth/logout', { refreshToken });
  },

  /** Begins admin TOTP enrollment; returns the otpauth URI to render as a QR code (PDR §1.7). */
  async enrollMfa(): Promise<{ otpAuthUri: string }> {
    const { data } = await api.post<{ otpAuthUri: string }>('/auth/mfa/enroll');
    return data;
  },

  /** Activates MFA after confirming a code from the authenticator app. */
  async verifyMfa(code: string): Promise<void> {
    await api.post('/auth/mfa/verify', { code });
  },
};
