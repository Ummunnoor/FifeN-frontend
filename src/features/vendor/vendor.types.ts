import type { VerificationMethod } from '@/shared/types/enums';

export type VendorRequestStatus = 'Pending' | 'Approved' | 'Rejected';

/** Result of submitting (or reading) a vendor onboarding request (PDR §2.9). */
export interface VendorRequestResponse {
  id: string;
  status: VendorRequestStatus;
  nameMatch: boolean;
  createdAtUtc: string;
}

/** Vendor onboarding application. `identifierToken` (raw NIN/CAC) is never cached client-side. */
export interface CreateVendorRequestPayload {
  businessName: string;
  whatsAppNumber: string;
  method: VerificationMethod;
  identifierToken: string;
}

export interface UpdateVendorProfilePayload {
  whatsAppNumber: string;
}

/** Public shop header shown to buyers (PDR §2.x). */
export interface VendorPublicResponse {
  id: string;
  businessName: string;
  verified: boolean;
  averageRating: number;
  reviewCount: number;
}
