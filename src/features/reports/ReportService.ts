import { api } from '@/shared/lib/api';
import type { ReportReason, ReportTargetType } from '@/shared/types/enums';

export interface CreateReportPayload {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  note?: string;
}

/** Typed gateway for buyer content reports (PDR §2.7). */
export const ReportService = {
  async create(payload: CreateReportPayload): Promise<void> {
    await api.post('/reports', payload);
  },
};
