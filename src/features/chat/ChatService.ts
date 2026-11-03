import { api } from '@/shared/lib/api';
import type { ChatConversation, ChatMessage, SendMessagePayload } from '@/features/chat/chat.types';

type ApiChatMessage = Omit<ChatMessage, 'content' | 'senderId'> & {
  body: string;
  senderUserId: string | null;
};

function mapMessage(message: ApiChatMessage): ChatMessage {
  return {
    ...message,
    senderId: message.senderUserId,
    content: message.body,
  };
}

export const ChatService = {
  async getConversations(): Promise<ChatConversation[]> {
    const { data } = await api.get<ChatConversation[] | { items: ChatConversation[] }>('/chats');
    return Array.isArray(data) ? data : data.items;
  },

  async getMessages(id: string): Promise<ChatMessage[]> {
    const { data } = await api.get<{ items: ApiChatMessage[] }>(`/chats/${id}/messages`);
    return data.items.map(mapMessage);
  },

  async sendMessage(id: string, payload: SendMessagePayload): Promise<ChatMessage> {
    const { data } = await api.post<ApiChatMessage>(`/chats/${id}/messages`, {
      message: payload.content,
    });
    return mapMessage(data);
  },

  async proceedToPay(id: string): Promise<ChatMessage> {
    const { data } = await api.post<{ message: ApiChatMessage }>(`/chats/${id}/proceed-to-pay`);
    return mapMessage(data.message);
  },
};
