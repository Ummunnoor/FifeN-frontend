import { api } from '@/shared/lib/api';
import type { PagedResponse } from '@/shared/types/api.types';
import type {
  CreateReviewPayload,
  ExpressInterestPayload,
  InterestResponse,
  ProductDetail,
  ReviewResponse,
} from '@/features/product/product.types';

/** Typed gateway for listing detail, reviews, and the WhatsApp lead hand-off (PDR §2.3–2.6). */
export const ProductService = {
  async getById(id: string): Promise<ProductDetail> {
    const { data } = await api.get<ProductDetail>(`/products/${id}`);
    return data;
  },

  async getReviews(id: string, page: number, pageSize: number): Promise<PagedResponse<ReviewResponse>> {
    const { data } = await api.get<PagedResponse<ReviewResponse>>(`/products/${id}/reviews`, {
      params: { page, pageSize },
    });
    return data;
  },

  /** Records a lead and returns the pre-filled wa.me link. Requires authentication. */
  async expressInterest(id: string, payload: ExpressInterestPayload): Promise<InterestResponse> {
    const { data } = await api.post<InterestResponse>(`/products/${id}/interest`, payload);
    return data;
  },

  async createReview(id: string, payload: CreateReviewPayload): Promise<ReviewResponse> {
    const { data } = await api.post<ReviewResponse>(`/products/${id}/reviews`, payload);
    return data;
  },

  /** Edits the caller's own review (author only, within 30 days). */
  async updateReview(reviewId: string, payload: CreateReviewPayload): Promise<ReviewResponse> {
    const { data } = await api.put<ReviewResponse>(`/reviews/${reviewId}`, payload);
    return data;
  },
};
