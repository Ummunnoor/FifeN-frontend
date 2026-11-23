import type {
  ListingStatus,
  NigerianState,
  PriceType,
  ProductSort,
} from '@/shared/types/enums';

/** Compact listing projection for grids and search results (PDR §2.2). */
export interface ProductSummary {
  id: string;
  title: string;
  priceAmount: number;
  currency: string;
  priceType: PriceType;
  coverUrl: string | null;
  city: string;
  state: NigerianState;
  vendorId: string;
  vendorName: string;
  vendorVerified: boolean;
  averageRating: number;
  status: ListingStatus;
}

/** Active category for selection and discovery. */
export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  isConsumable: boolean;
}

/** Buyer-facing search/browse parameters. Undefined fields are omitted from the query string. */
export interface ProductQuery {
  q?: string;
  categoryId?: string;
  state?: NigerianState;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  color?: string;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
}
