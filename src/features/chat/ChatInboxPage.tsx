import { Link } from 'react-router-dom';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { useApi } from '@/shared/hooks/useApi';
import { Card } from '@/shared/components/Card';
import { PageHeader } from '@/shared/components/PageHeader';
import { LoadingState, ErrorState, EmptyState } from '@/shared/components/StateViews';
import { formatDate } from '@/shared/lib/format';
import { ChatService } from '@/features/chat/ChatService';
import { useAuth } from '@/shared/hooks/useAuth';

export function ChatInboxPage() {
  const { isVendor } = useAuth();
  const { data, error, isLoading, reload } = useApi(() => ChatService.getConversations(), []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader title="Chats" description="Keep delivery, timing, and payment conversations in one place." />
      {isLoading ? <LoadingState label="Loading chats..." /> : null}
      {error ? <ErrorState error={error} onRetry={reload} /> : null}
      {!isLoading && !error && data?.length === 0 ? (
        <EmptyState title="No chats yet" description="Start a chat from any listing you're interested in." />
      ) : null}
      <div className="space-y-3">
        {data?.map((conversation) => (
          <Link key={conversation.id} to={`/chat/${conversation.id}`} className="block">
            <Card className="flex items-center gap-4 p-4 transition-shadow hover:shadow-md">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-50 text-accent-700">
                <ChatBubbleLeftRightIcon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-slate-900">{conversation.productTitle}</span>
                <span className="mt-1 block text-sm text-slate-500">
                  {isVendor ? conversation.participantName : conversation.vendorName}
                </span>
              </span>
              <time className="shrink-0 text-xs text-slate-400" dateTime={conversation.updatedAtUtc}>
                {formatDate(conversation.updatedAtUtc)}
              </time>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
