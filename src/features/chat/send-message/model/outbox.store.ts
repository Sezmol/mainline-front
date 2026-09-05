import type { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { create } from "zustand";

import { chatKeys, replaceMessage } from "@entities/chat";

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
  for (const entry of useOutboxStore.getState().entries) {
    try {
      const { data } = await chatsControllerSend({
        path: { id: entry.chatId },
        body: {
          body: entry.body,
          ...(entry.postId ? { postId: entry.postId } : {}),
        },
        throwOnError: true,
      });

      replaceMessage(queryClient, entry.chatId, entry.messageId, data);
      useOutboxStore.getState().drop(entry.messageId);

      void queryClient.invalidateQueries({
        queryKey: chatKeys.all(),
        refetchType: "none",
      });
    } catch (error) {
      if (error instanceof NetworkError) return;

      replaceMessage(queryClient, entry.chatId, entry.messageId, null);
      useOutboxStore.getState().drop(entry.messageId);
      toast.error(error instanceof Error ? error.message : "Message not sent");
    }
  }
};

let flushing = false;

export const flushOutbox = async (queryClient: QueryClient) => {
  if (flushing) return;
  flushing = true;

  try {
    await sendAll(queryClient);
  } finally {
    flushing = false;
  }
};
