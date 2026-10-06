import type { InfiniteData } from "@tanstack/react-query";

import type { Message, MessagePage } from "../chat.types";

const pendingMessages = new Map<string, Map<string, Message>>();

export const rememberPendingMessage = (chatId: string, message: Message) => {
  const pending = pendingMessages.get(chatId) ?? new Map<string, Message>();
  pending.set(message.id, message);
  pendingMessages.set(chatId, pending);
};

export const forgetPendingMessage = (chatId: string, id: string) => {
  const pending = pendingMessages.get(chatId);
  pending?.delete(id);
  if (pending?.size === 0) pendingMessages.delete(chatId);
};

export const forgetPendingChat = (chatId: string) => {
  pendingMessages.delete(chatId);
};

export const withPendingMessages = (
  chatId: string,
  data: InfiniteData<MessagePage>,
) => {
  const pending = pendingMessages.get(chatId);
  if (!pending?.size || data.pages.length === 0) return data;

  const known = new Set(
    data.pages.flatMap((page) => page.items.map((item) => item.id)),
  );
  const missing = [...pending.values()]
    .toReversed()
    .filter((item) => !known.has(item.id));
  if (missing.length === 0) return data;

  return {
    ...data,
    pages: data.pages.map((page, index) => ({
      ...page,
      items: index === 0 ? [...missing, ...page.items] : page.items,
    })),
  };
};
