import { create } from 'zustand';
import { NotificationService } from '@/features/notifications/NotificationService';

interface NotificationState {
  unread: number;
  /** Refreshes the unread count from the server. Safe to call from anywhere; failures are ignored. */
  refresh: () => Promise<void>;
  reset: () => void;
}

/**
 * Shared unread-count state so the header badge and the notifications page stay in sync — the page
 * calls {@link NotificationState.refresh} after marking items read and the badge updates instantly.
 */
export const useNotificationStore = create<NotificationState>((set) => ({
  unread: 0,
  refresh: async () => {
    try {
      set({ unread: await NotificationService.getUnreadCount() });
    } catch {
      // Non-fatal — leave the last known count.
    }
  },
  reset: () => set({ unread: 0 }),
}));
