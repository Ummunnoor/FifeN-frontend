import type {
  ListingStatus,
  NigerianState,
  PriceType,
  ProductCondition,
} from '@/shared/types/enums';

/** Create-a-listing payload (PDR §2.11). */
export interface CreateProductPayload {
  title: string;
  description: string;
  priceAmount: number;
  priceType: PriceType;
  condition: ProductCondition;
  categoryId: string;
  state: NigerianState;
  city: string;
  attributes?: Record<string, string>;
}

/** Update payload — attributes are managed separately, so omitted here. */
export type UpdateProductPayload = Omit<CreateProductPayload, 'attributes'>;

/** Vendor-settable listing statuses (admin-only `Removed` excluded). */
export type VendorListingStatus = Extract<ListingStatus, 'Live' | 'Unavailable' | 'Archived'>;
