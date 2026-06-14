import type { NotificationType } from '@/shared/types/enums';

/** A user's in-app notification (PDR §2.8). */
export interface NotificationResponse {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  createdAtUtc: string;
}
