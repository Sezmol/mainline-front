import { io, type Socket } from "socket.io-client";

import type { ChatDtoOutput, MessageDtoOutput } from "./generated";

export interface ChatServerEvents {
  new_message: (payload: { chatId: string; message: MessageDtoOutput }) => void;
  message_deleted: (payload: { chatId: string; messageId: string }) => void;
  chat_created: (payload: { chat: ChatDtoOutput }) => void;
  chat_updated: (payload: { chat: ChatDtoOutput }) => void;
  chat_removed: (payload: { chatId: string }) => void;
  write_access_changed: (payload: {
    chatId: string;
    canWrite: boolean;
  }) => void;
  unread_changed: (payload: { chatId: string; unreadCount: number }) => void;
  notification_created: () => void;
  board_changed: (payload: { projectId: string }) => void;
  session_expired: () => void;
}

export type ChatSocket = Socket<ChatServerEvents, Record<string, never>>;

let socket: ChatSocket | null = null;

export const getSocket = (): ChatSocket =>
  (socket ??= io({ path: "/api/socket.io", autoConnect: false }));

export const closeSocket = () => {
  socket?.disconnect();
  socket = null;
};
