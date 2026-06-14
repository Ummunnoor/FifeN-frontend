import type { LeadStatus } from '@/shared/types/enums';

/** A lead as shown on the vendor's leads dashboard (PDR §2.12). */
export interface LeadResponse {
  id: string;
  productId: string;
  productTitle: string;
  buyerDisplayName: string;
  message: string | null;
  offerPrice: number | null;
  status: LeadStatus;
  isCrossDiscovery: boolean;
  createdAtUtc: string;
}
