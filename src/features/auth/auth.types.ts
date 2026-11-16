import type { Session } from '@/shared/stores/authStore';

export interface OtpRequestPayload {
  email: string;
}

export interface OtpVerifyPayload {
  email: string;
  code: string;
}

export interface OtpVerifyResponse {
  isAuthenticated: boolean;
  requiresTotp?: boolean;
  mfaEnrollmentRequired?: boolean;
  mfaSetupToken?: string;
  mfaVerificationRequired?: boolean;
  mfaChallengeToken?: string;
  tempToken?: string;
  message?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAtUtc?: string;
  user?: Session['user'];
}

export interface TotpVerifyPayload {
  code: string;
  tempToken: string;
}

export type { Session };
