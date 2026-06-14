import { useState } from 'react';
import { CheckIcon } from '@heroicons/react/20/solid';
import { useApi, useMutation } from '@/shared/hooks/useApi';
import { PageHeader } from '@/shared/components/PageHeader';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Pagination } from '@/shared/components/Pagination';
import { LoadingState, ErrorState, EmptyState } from '@/shared/components/StateViews';
import { cn } from '@/shared/lib/cn';
import { formatDate } from '@/shared/lib/format';
import { NotificationService } from '@/features/notifications/NotificationService';
import { useNotificationStore } from '@/features/notifications/notificationStore';

/** In-app notification centre: list (newest first), mark one / all read (PDR §2.8). */
export function NotificationsPage() {
  const [page, setPage] = useState(1);
  const refreshUnread = useNotificationStore((s) => s.refresh);

  const { data, error, isLoading, reload } = useApi(() => NotificationService.getFeed(page, 20), [page]);
  const markRead = useMutation(NotificationService.markRead);
  const markAll = useMutation(NotificationService.markAllRead);

  async function onMarkRead(id: string) {
    await markRead.run(id);
    reload();
    void refreshUnread();
  }
  async function onMarkAll() {
    await markAll.run();
    reload();
    void refreshUnread();
  }

  const hasUnread = data?.items.some((n) => !n.isRead) ?? false;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Notifications"
        action={
          hasUnread ? (
            <Button variant="secondary" size="sm" isLoading={markAll.isLoading} onClick={onMarkAll}>
              Mark all read
            </Button>
          ) : undefined
        }
      />

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState title="No notifications" description="You're all caught up." />
      ) : (
        <div className="space-y-3">
          <ul className="space-y-2">
            {data.items.map((n) => (
              <li key={n.id}>
                <Card className={cn('flex items-start gap-3 p-4', !n.isRead && 'border-accent-200 bg-accent-50/50')}>
                  {!n.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent-500" aria-hidden />}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-slate-900">{n.title}</p>
                      <time className="shrink-0 text-xs text-slate-400">{formatDate(n.createdAtUtc)}</time>
                    </div>
                    <p className="mt-0.5 text-sm text-slate-600">{n.body}</p>
                  </div>
                  {!n.isRead && (
                    <button
                      type="button"
                      aria-label="Mark as read"
                      onClick={() => onMarkRead(n.id)}
                      className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-white hover:text-accent-600"
                    >
                      <CheckIcon className="h-5 w-5" />
                    </button>
                  )}
                </Card>
              </li>
            ))}
          </ul>
          <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
