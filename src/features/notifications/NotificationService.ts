import { api } from '@/shared/lib/api';
import type { PagedResponse } from '@/shared/types/api.types';
import type { NotificationResponse } from '@/features/notifications/notifications.types';

/** Typed gateway for the in-app notification centre (PDR §2.8). */
export const NotificationService = {
  async getFeed(page: number, pageSize: number): Promise<PagedResponse<NotificationResponse>> {
    const { data } = await api.get<PagedResponse<NotificationResponse>>('/notifications', {
      params: { page, pageSize },
    });
    return data;
  },

  async getUnreadCount(): Promise<number> {
    const { data } = await api.get<{ count: number }>('/notifications/unread-count');
    return data.count;
  },

  async markRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  },

  async markAllRead(): Promise<void> {
    await api.patch('/notifications/read-all');
  },
};
