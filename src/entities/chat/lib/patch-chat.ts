import type { InfiniteData, QueryClient } from "@tanstack/react-query";

import { chatKeys } from "../api";
import type { ChatPage, ChatView, Message, MessagePage } from "../chat.types";
import {
  forgetPendingChat,
  forgetPendingMessage,
  rememberPendingMessage,
} from "../model/pending-messages";

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
  forgetPendingChat(chatId);
  reconciliationWrites?.delete(chatId);
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

let reconciliationWrites: Map<string, Map<string, Message | null>> | null =
  null;

const recordWrite = (chatId: string, id: string, message: Message | null) => {
  if (!reconciliationWrites) return;
  const writes =
    reconciliationWrites.get(chatId) ?? new Map<string, Message | null>();
  writes.set(id, message);
  reconciliationWrites.set(chatId, writes);
};

export const beginMessageReconciliation = () => {
  reconciliationWrites = new Map();
};

export const isPending = (message: Message) => message.pending === true;

export const findMessage = (
  queryClient: QueryClient,
  chatId: string,
  id: string,
) =>
  queryClient
    .getQueryData<InfiniteData<MessagePage>>(chatKeys.messages(chatId))
    ?.pages.flatMap((page) => page.items)
    .find((item) => item.id === id) ?? null;

const restartLoadingHistory = (queryClient: QueryClient, chatId: string) => {
  const queryKey = chatKeys.messages(chatId);

  if (queryClient.isFetching({ queryKey }) > 0) {
    void queryClient.invalidateQueries({ queryKey });
  }
};

export const addMessage = (
  queryClient: QueryClient,
  chatId: string,
  message: Message,
) => {
  if (isPending(message)) rememberPendingMessage(chatId, message);
  else forgetPendingMessage(chatId, message.id);

  recordWrite(chatId, message.id, message);

  const known = findMessage(queryClient, chatId, message.id);
  if (known && (isPending(message) || !isPending(known))) return;

  queryClient.setQueryData<InfiniteData<MessagePage>>(
    chatKeys.messages(chatId),
    (data) =>
      data && {
        ...data,
        pages: data.pages.map((page, index) => ({
          ...page,
          items: known
            ? page.items.map((item) =>
                item.id === message.id ? message : item,
              )
            : [...(index === 0 ? [message] : []), ...page.items],
        })),
      },
  );

  if (!isPending(message)) restartLoadingHistory(queryClient, chatId);
};

export const removeMessage = (
  queryClient: QueryClient,
  chatId: string,
  id: string,
) => {
  forgetPendingMessage(chatId, id);
  recordWrite(chatId, id, null);
  queryClient.setQueryData<InfiniteData<MessagePage>>(
    chatKeys.messages(chatId),
    (data) =>
      data && {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          items: page.items.filter((item) => item.id !== id),
        })),
      },
  );

  restartLoadingHistory(queryClient, chatId);
};

export const finishMessageReconciliation = (queryClient: QueryClient) => {
  const writes = reconciliationWrites;
  reconciliationWrites = null;
  if (!writes) return;

  for (const [chatId, messages] of writes) {
    if (!queryClient.getQueryData(chatKeys.messages(chatId))) continue;

    for (const [id, message] of messages) {
      if (message) addMessage(queryClient, chatId, message);
      else removeMessage(queryClient, chatId, id);
    }
  }
};
