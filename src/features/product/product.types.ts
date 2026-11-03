import type {
  ListingStatus,
  NigerianState,
  PriceType,
  ProductCondition,
} from '@/shared/types/enums';

/** Full listing projection for the detail page (PDR §2.3). */
export interface ProductDetail {
  id: string;
  title: string;
  description: string;
  priceAmount: number;
  currency: string;
  priceType: PriceType;
  condition: ProductCondition;
  categoryName: string;
  state: NigerianState;
  city: string;
  imageUrls: string[];
  vendorId: string;
  vendorName: string;
  vendorVerified: boolean;
  averageRating: number;
  reviewCount: number;
  status: ListingStatus;
  createdAtUtc: string;
  /** True when the authenticated caller owns this listing — hide the buyer CTAs. */
  isOwnListing: boolean;
}

/** A review as shown publicly (PDR §2.6). */
export interface ReviewResponse {
  id: string;
  authorDisplayName: string;
  rating: number;
  text: string | null;
  contactedVendor: boolean;
  createdAtUtc: string;
}

/** Buyer's "I'm interested" payload — both fields optional (PDR §2.4). */
export interface ExpressInterestPayload {
  message?: string;
  offerPrice?: number;
}

/** The recorded buyer interaction, which identifies the in-app conversation. */
export interface InterestResponse {
  interactionId: string;
}

export interface CreateReviewPayload {
  rating: number;
  text?: string;
}
