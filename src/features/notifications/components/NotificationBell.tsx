import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BellIcon } from '@heroicons/react/24/outline';
import { useNotificationStore } from '@/features/notifications/notificationStore';

/** Header bell with an unread-count badge. Refreshes the count on mount. */
export function NotificationBell() {
  const unread = useNotificationStore((s) => s.unread);
  const refresh = useNotificationStore((s) => s.refresh);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <Link
      to="/notifications"
      aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ''}`}
      className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"
    >
      <BellIcon className="h-6 w-6" />
      {unread > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-600 px-1 text-xs font-semibold text-white">
          {unread > 99 ? '99+' : unread}
        </span>
      )}
    </Link>
  );
}
