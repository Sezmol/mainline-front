import type {
  ChatDtoOutput,
  ChatPageDtoOutput,
  ChatParticipantDtoOutput,
  ChatViewDtoOutput,
  MessageDtoOutput,
  MessagePageDtoOutput,
} from "@shared/api";

export type Chat = ChatDtoOutput;

export type ChatView = ChatViewDtoOutput;

export type ChatPage = ChatPageDtoOutput;

export type Message = MessageDtoOutput & { pending?: boolean };

export type MessagePage = MessagePageDtoOutput;

export type ChatParticipant = ChatParticipantDtoOutput;

export type ChatFilter = "chats" | "comments" | "archive";
