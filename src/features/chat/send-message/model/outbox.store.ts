import { onlineManager, type QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { create } from "zustand";

import { addMessage, chatKeys, removeMessage } from "@entities/chat";

import { chatsControllerSend, NetworkError } from "@shared/api";

export interface OutboxEntry {
  chatId: string;
  messageId: string;
  body: string;
  postId?: string;
}

interface OutboxState {
  entries: OutboxEntry[];
  enqueue: (entry: OutboxEntry) => void;
  drop: (messageId: string) => void;
}

export const useOutboxStore = create<OutboxState>((set) => ({
  entries: [],
  enqueue: (entry) => set((state) => ({ entries: [...state.entries, entry] })),
  drop: (messageId) =>
    set((state) => ({
      entries: state.entries.filter((entry) => entry.messageId !== messageId),
    })),
}));

const sendAll = async (queryClient: QueryClient) => {
  let [entry] = useOutboxStore.getState().entries;

  while (entry) {
    try {
      const { data } = await chatsControllerSend({
        path: { id: entry.chatId },
        body: {
          id: entry.messageId,
          body: entry.body,
          ...(entry.postId ? { postId: entry.postId } : {}),
        },
        throwOnError: true,
      });

      addMessage(queryClient, entry.chatId, data);
      useOutboxStore.getState().drop(entry.messageId);

      void queryClient.invalidateQueries({
        queryKey: chatKeys.all(),
        refetchType: "none",
      });
    } catch (error) {
      if (error instanceof NetworkError) return;

      removeMessage(queryClient, entry.chatId, entry.messageId);
      useOutboxStore.getState().drop(entry.messageId);
      toast.error(error instanceof Error ? error.message : "Message not sent");
    }

    [entry] = useOutboxStore.getState().entries;
  }
};

let flushing: Promise<void> | null = null;

export const flushOutbox = (queryClient: QueryClient) => {
  flushing ??= sendAll(queryClient).finally(() => {
    flushing = null;
  });

  return flushing;
};

export const startOutbox = (queryClient: QueryClient) => {
  let active = true;
  let running = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let delay = 1_000;

  const schedule = (wait: number) => {
    if (!active || running || !onlineManager.isOnline()) return;
    if (useOutboxStore.getState().entries.length === 0) return;

    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
      if (!active || !onlineManager.isOnline()) return;
      running = true;
      void flushOutbox(queryClient).then(() => {
        running = false;
        schedule(delay);
        delay = Math.min(delay * 2, 30_000);
      });
    }, wait);
  };

  const unsubscribe = useOutboxStore.subscribe((state, previous) => {
    if (state.entries.length <= previous.entries.length) return;
    delay = 1_000;
    schedule(0);
  });
  const unsubscribeOnline = onlineManager.subscribe((online) => {
    if (online) {
      delay = 1_000;
      schedule(0);
    }
  });
  schedule(0);

  return () => {
    active = false;
    clearTimeout(timer);
    unsubscribe();
    unsubscribeOnline();
  };
};
