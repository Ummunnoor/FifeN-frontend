export interface ChatConversation {
  id: string;
  productId: string;
  productTitle: string;
  vendorName: string;
  participantName: string;
  updatedAtUtc: string;
}

export interface ChatMessage {
  id: string;
  interactionId: string;
  senderId: string | null;
  senderDisplayName: string;
  content: string;
  createdAtUtc: string;
  isSystem: boolean;
}

export interface SendMessagePayload {
  content: string;
}
