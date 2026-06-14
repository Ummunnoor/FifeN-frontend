import { api } from '@/shared/lib/api';
import type {
  CreateVendorRequestPayload,
  UpdateVendorProfilePayload,
  VendorPublicResponse,
  VendorRequestResponse,
} from '@/features/vendor/vendor.types';

/** Typed gateway for vendor onboarding and self-service profile (PDR §2.9–2.10). */
export const VendorService = {
  /** Submits an onboarding application (runs KYC server-side). */
  async submitRequest(payload: CreateVendorRequestPayload): Promise<VendorRequestResponse> {
    const { data } = await api.post<VendorRequestResponse>('/vendor/requests', payload);
    return data;
  },

  /** The caller's latest application, or null if they've never applied (404 → null). */
  async getMyRequest(): Promise<VendorRequestResponse | null> {
    try {
      const { data } = await api.get<VendorRequestResponse>('/vendor/requests/me');
      return data;
    } catch (error) {
      if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async updateProfile(payload: UpdateVendorProfilePayload): Promise<void> {
    await api.patch('/vendor/profile', payload);
  },

  async getPublic(vendorId: string): Promise<VendorPublicResponse> {
    const { data } = await api.get<VendorPublicResponse>(`/vendors/${vendorId}`);
    return data;
  },
};
