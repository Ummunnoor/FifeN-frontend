import type { Session } from '@/shared/stores/authStore';

export interface OtpRequestPayload {
  phoneNumber: string;
}

export interface OtpVerifyPayload {
  phoneNumber: string;
  code: string;
  /** Required only for MFA-enrolled admins (PDR §1.3). */
  totpCode?: string;
}

export type { Session };
