import type { InfiniteData, QueryClient } from "@tanstack/react-query";

import { chatKeys } from "../api";
import type { ChatPage, ChatView, Message, MessagePage } from "../chat.types";

interface PatchOptions {
  toTop?: boolean;
}

export const patchChat = (
  queryClient: QueryClient,
  chatId: string,
  update: (view: ChatView) => ChatView,
  { toTop = false }: PatchOptions = {},
) => {
  queryClient.setQueriesData<InfiniteData<ChatPage>>(
    { queryKey: chatKeys.all() },
    (data) => {
      if (!data) return data;

      const current = data.pages
        .flatMap((page) => page.items)
        .find((item) => item.chat.id === chatId);

      if (!current) return data;
      const updated = update(current);

      return {
        ...data,
        pages: data.pages.map((page, index) => ({
          ...page,
          items: toTop
            ? [
                ...(index === 0 ? [updated] : []),
                ...page.items.filter((item) => item.chat.id !== chatId),
              ]
            : page.items.map((item) =>
                item.chat.id === chatId ? updated : item,
              ),
        })),
      };
    },
  );

  queryClient.setQueryData<ChatView>(
    chatKeys.byId(chatId),
    (view) => view && update(view),
  );
};

export const findChat = (queryClient: QueryClient, chatId: string) =>
  queryClient
    .getQueriesData<InfiniteData<ChatPage>>({ queryKey: chatKeys.all() })
    .flatMap(([, data]) => data?.pages ?? [])
    .flatMap((page) => page.items)
    .find((item) => item.chat.id === chatId) ??
  queryClient.getQueryData<ChatView>(chatKeys.byId(chatId));

export const dropChat = (queryClient: QueryClient, chatId: string) => {
  queryClient.setQueriesData<InfiniteData<ChatPage>>(
    { queryKey: chatKeys.all() },
    (data) =>
      data && {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          items: page.items.filter((item) => item.chat.id !== chatId),
        })),
      },
  );

  queryClient.removeQueries({ queryKey: chatKeys.byId(chatId) });
  queryClient.removeQueries({ queryKey: chatKeys.messages(chatId) });
};

const PENDING_PREFIX = "pending:";

export const pendingId = () => `${PENDING_PREFIX}${crypto.randomUUID()}`;

export const isPending = (message: Message) =>
  message.id.startsWith(PENDING_PREFIX);

export const addMessage = (
  queryClient: QueryClient,
  chatId: string,
  message: Message,
) => {
  queryClient.setQueryData<InfiniteData<MessagePage>>(
    chatKeys.messages(chatId),
    (data) => {
      if (!data) return data;

      const known = data.pages.some((page) =>
        page.items.some((item) => item.id === message.id),
      );

      if (known) return data;

      const isTwin = (item: Message) =>
        isPending(item) &&
        item.author.id === message.author.id &&
        item.body === message.body;

      return {
        ...data,
        pages: data.pages.map((page, index) => ({
          ...page,
          items:
            index === 0
              ? [message, ...page.items.filter((item) => !isTwin(item))]
              : page.items.filter((item) => !isTwin(item)),
        })),
      };
    },
  );
};

export const findMessage = (
  queryClient: QueryClient,
  chatId: string,
  id: string,
) =>
  queryClient
    .getQueryData<InfiniteData<MessagePage>>(chatKeys.messages(chatId))
    ?.pages.flatMap((page) => page.items)
    .find((item) => item.id === id) ?? null;

export const replaceMessage = (
  queryClient: QueryClient,
  chatId: string,
  id: string,
  message: Message | null,
) => {
  queryClient.setQueryData<InfiniteData<MessagePage>>(
    chatKeys.messages(chatId),
    (data) =>
      data && {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          items: message
            ? page.items.map((item) => (item.id === id ? message : item))
            : page.items.filter((item) => item.id !== id),
        })),
      },
  );
};
