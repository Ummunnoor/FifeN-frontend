import type { Session } from '@/shared/stores/authStore';

export interface OtpRequestPayload {
  email: string;
}

export interface OtpVerifyPayload {
  email: string;
  code: string;
  /** Required only for MFA-enrolled admins (PDR §1.3). */
  totpCode?: string;
}

export type { Session };
