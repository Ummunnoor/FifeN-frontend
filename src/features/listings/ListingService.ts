import { api } from '@/shared/lib/api';
import type { PagedResponse } from '@/shared/types/api.types';
import type { ProductSummary } from '@/features/discovery/discovery.types';
import type { ProductDetail } from '@/features/product/product.types';
import type {
  CreateProductPayload,
  UpdateProductPayload,
  VendorListingStatus,
} from '@/features/listings/listings.types';

/** Typed gateway for vendor listing management (PDR §2.11). */
export const ListingService = {
  async create(payload: CreateProductPayload): Promise<ProductDetail> {
    const { data } = await api.post<ProductDetail>('/products', payload);
    return data;
  },

  async update(id: string, payload: UpdateProductPayload): Promise<ProductDetail> {
    const { data } = await api.put<ProductDetail>(`/products/${id}`, payload);
    return data;
  },

  async changeStatus(id: string, status: VendorListingStatus): Promise<void> {
    await api.patch(`/products/${id}/status`, { status });
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  },

  /** Uploads 1–5 images (JPEG/PNG/WebP, ≤5MB each). Returns the stored URLs. */
  async uploadImages(id: string, files: File[]): Promise<string[]> {
    const form = new FormData();
    files.forEach((file) => form.append('files', file));
    const { data } = await api.post<string[]>(`/products/${id}/images`, form, {
      // Let the browser set the multipart boundary (override the JSON default).
      headers: { 'Content-Type': undefined as unknown as string },
    });
    return data;
  },

  /**
   * The authenticated vendor's own listings, all statuses (live, probation, unavailable, archived),
   * for the management dashboard. Keys off the JWT server-side — no vendor id needed.
   */
  async getMine(page: number, pageSize: number): Promise<PagedResponse<ProductSummary>> {
    const { data } = await api.get<PagedResponse<ProductSummary>>('/products/mine', {
      params: { page, pageSize },
    });
    return data;
  },

  /**
   * A vendor's public storefront listings (live only) — used by the public vendor shop page.
   */
  async getByVendor(vendorId: string, page: number, pageSize: number): Promise<PagedResponse<ProductSummary>> {
    const { data } = await api.get<PagedResponse<ProductSummary>>(`/vendors/${vendorId}/products`, {
      params: { page, pageSize },
    });
    return data;
  },
};
