import { api } from '@/shared/lib/api';
import type { PagedResponse } from '@/shared/types/api.types';
import type { LeadStatus } from '@/shared/types/enums';
import type { LeadResponse } from '@/features/leads/leads.types';

/** Typed gateway for the vendor leads dashboard (PDR §2.12). */
export const LeadService = {
  async getLeads(
    status: LeadStatus | undefined,
    page: number,
    pageSize: number,
  ): Promise<PagedResponse<LeadResponse>> {
    const { data } = await api.get<PagedResponse<LeadResponse>>('/vendor/leads', {
      params: { status, page, pageSize },
    });
    return data;
  },

  async updateStatus(id: string, status: LeadStatus): Promise<void> {
    await api.patch(`/vendor/leads/${id}`, { status });
  },
};
