import { Fragment, useEffect, useRef, useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { useApi, useMutation } from '@/shared/hooks/useApi';
import { useAuth } from '@/shared/hooks/useAuth';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Input } from '@/shared/components/Input';
import { LoadingState } from '@/shared/components/StateViews';
import { formatDate } from '@/shared/lib/format';
import { ChatService } from '@/features/chat/ChatService';
import type { ChatMessage } from '@/features/chat/chat.types';

const timeFmt = new Intl.DateTimeFormat('en-NG', {
  hour: 'numeric',
  minute: '2-digit',
});

function formatTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '' : timeFmt.format(date);
}

export function ChatPage() {
  const { id = '' } = useParams();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const send = useMutation(ChatService.sendMessage);
  const pay = useMutation(ChatService.proceedToPay);
  const { data: loadedMessages, error: messagesError, isLoading: messagesLoading, reload } = useApi(
    () => (id ? ChatService.getMessages(id) : Promise.reject(new Error('A conversation id is required.'))),
    [id],
  );

  useEffect(() => {
    if (loadedMessages) setMessages(loadedMessages);
  }, [loadedMessages]);

  useEffect(() => {
    const interval = window.setInterval(reload, 4000);
    return () => window.clearInterval(interval);
  }, [reload]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function submitMessage(event: FormEvent) {
    event.preventDefault();
    const content = message.trim();
    if (!content) return;
    try {
      const sent = await send.run(id, { content });
      setMessages((current) => [...current, sent]);
      setMessage('');
    } catch {
      // The mutation owns the visible error state.
    }
  }

  async function proceedToPay() {
    if (messages.some((item) => item.isSystem)) return;
    try {
      const sent = await pay.run(id);
      setMessages((current) => [...current, sent]);
    } catch {
      // The mutation owns the visible error state.
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <Card className="overflow-hidden">
        <header className="border-b border-slate-200 px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-accent-700">Trade9ja chat</p>
          <h1 className="mt-1 text-lg font-semibold text-slate-900">Conversation</h1>
          <p className="mt-1 text-sm text-slate-500">Discuss delivery, timing, and payment securely in Trade9ja.</p>
        </header>

        <div className="flex min-h-[24rem] flex-col gap-3 bg-slate-50 p-5">
          {messagesLoading && messages.length === 0 ? <LoadingState label="Loading messages..." /> : null}
          {messagesError ? <p role="alert" className="text-sm text-red-600">{messagesError.detail}</p> : null}
          {!messagesLoading && !messagesError && messages.length === 0 ? (
            <p className="m-auto text-center text-sm text-slate-500">No messages yet. Start the conversation.</p>
          ) : null}
          {messages.map((item, index) => {
            const mine = item.senderId === user?.id;
            const day = formatDate(item.createdAtUtc);
            const previousDay = index > 0 ? formatDate(messages[index - 1].createdAtUtc) : null;
            return (
              <Fragment key={item.id}>
                {day !== previousDay ? (
                  <div className="self-center rounded-full bg-white px-3 py-1 text-xs text-slate-500 shadow-sm">{day}</div>
                ) : null}
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${item.isSystem ? 'self-center bg-accent-50 text-accent-900 ring-1 ring-accent-200' : mine ? 'self-end bg-accent-600 text-white' : 'self-start bg-white text-slate-800 shadow-sm ring-1 ring-slate-200'}`}>
                  {!mine && !item.isSystem ? <p className="mb-1 text-xs font-medium text-slate-500">{item.senderDisplayName}</p> : null}
                  <p className="whitespace-pre-wrap">{item.content}</p>
                  <time className={`mt-1 block text-right text-[11px] ${mine ? 'text-accent-100' : 'text-slate-400'}`} dateTime={item.createdAtUtc}>{formatTime(item.createdAtUtc)}</time>
                </div>
              </Fragment>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-slate-200 p-4">
          {send.error ? <p role="alert" className="mb-3 text-sm text-red-600">{send.error.detail}</p> : null}
          <div className="mb-3 flex justify-end">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={proceedToPay}
              isLoading={pay.isLoading}
              disabled={messages.some((item) => item.isSystem)}
            >
              {messages.some((item) => item.isSystem) ? 'Payment details sent' : 'Proceed to pay'}
            </Button>
          </div>
          <form className="flex items-end gap-3" onSubmit={submitMessage}>
            <Input aria-label="Message" placeholder="Write a message..." value={message} onChange={(event) => setMessage(event.target.value)} />
            <Button type="submit" aria-label="Send message" isLoading={send.isLoading} leftIcon={<PaperAirplaneIcon className="h-5 w-5" />}>
              Send
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
