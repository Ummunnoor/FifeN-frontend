import { api } from '@/shared/lib/api';
import type { PagedResponse } from '@/shared/types/api.types';
import type {
  ListingStatus,
  RejectionReason,
  ReportStatus,
  ReviewStatus,
} from '@/shared/types/enums';
import type { VendorRequestStatus } from '@/features/vendor/vendor.types';
import type { ProductSummary } from '@/features/discovery/discovery.types';
import type {
  DashboardResponse,
  ReportResponse,
  VendorRequestQueueItem,
} from '@/features/admin/admin.types';

/** Typed gateway for the admin area (PDR §2.13–2.17). All actions are audited server-side. */
export const AdminService = {
  // --- Dashboard ---
  async getDashboard(): Promise<DashboardResponse> {
    const { data } = await api.get<DashboardResponse>('/admin/dashboard');
    return data;
  },

  // --- Vendor moderation (note: the queue returns a plain array, not a PagedResponse) ---
  async getVendorQueue(
    status: VendorRequestStatus,
    page: number,
    pageSize: number,
  ): Promise<VendorRequestQueueItem[]> {
    const { data } = await api.get<VendorRequestQueueItem[]>('/admin/vendor-requests', {
      params: { status, page, pageSize },
    });
    return data;
  },

  async approveVendor(id: string): Promise<void> {
    await api.post(`/admin/vendor-requests/${id}/approve`);
  },

  async rejectVendor(id: string, reason: RejectionReason): Promise<void> {
    await api.post(`/admin/vendor-requests/${id}/reject`, { reason });
  },

  async suspendVendor(vendorId: string, reason: string): Promise<void> {
    await api.post(`/admin/vendors/${vendorId}/suspend`, { reason });
  },

  async reinstateVendor(vendorId: string): Promise<void> {
    await api.post(`/admin/vendors/${vendorId}/reinstate`);
  },

  // --- Reports moderation ---
  async getReportQueue(
    status: ReportStatus | undefined,
    page: number,
    pageSize: number,
  ): Promise<PagedResponse<ReportResponse>> {
    const { data } = await api.get<PagedResponse<ReportResponse>>('/admin/reports', {
      params: { status, page, pageSize },
    });
    return data;
  },

  async resolveReport(id: string, status: ReportStatus, note: string): Promise<void> {
    await api.patch(`/admin/reports/${id}`, { status, note });
  },

  // --- Listing moderation queue (probation listings awaiting review) ---
  async getPendingListings(page: number, pageSize: number): Promise<PagedResponse<ProductSummary>> {
    const { data } = await api.get<PagedResponse<ProductSummary>>('/admin/products/pending', {
      params: { page, pageSize },
    });
    return data;
  },

  // --- Content takedowns (triggered from a report's target or the moderation queue) ---
  async moderateProduct(productId: string, status: ListingStatus, reason: string): Promise<void> {
    await api.post(`/admin/products/${productId}/moderate`, { status, reason });
  },

  async moderateReview(reviewId: string, status: ReviewStatus, reason: string): Promise<void> {
    await api.patch(`/admin/reviews/${reviewId}`, { status, reason });
  },
};
