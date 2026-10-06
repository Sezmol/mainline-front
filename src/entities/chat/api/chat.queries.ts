import {
  type InfiniteData,
  infiniteQueryOptions,
  replaceEqualDeep,
} from "@tanstack/react-query";

import {
  chatsControllerFindOneOptions,
  chatsControllerFindOneQueryKey,
  chatsControllerListInfiniteOptions,
  chatsControllerListInfiniteQueryKey,
  chatsControllerMessagesInfiniteOptions,
  chatsControllerMessagesInfiniteQueryKey,
  chatsControllerParticipantsOptions,
  chatsControllerParticipantsQueryKey,
} from "@shared/api";

import type { Chat, MessagePage } from "../chat.types";
import { withPendingMessages } from "../model/pending-messages";

const PAGE_SIZE = 20;
const HISTORY_PAGE_SIZE = 30;

export interface ChatListFilters {
  archived?: boolean;
  type?: Chat["type"];
}

export const chatKeys = {
  all: () => [{ _id: "chatsControllerList" }] as const,
  list: ({ archived = false, type }: ChatListFilters = {}) =>
    chatsControllerListInfiniteQueryKey({
      query: {
        archived: String(archived),
        ...(type ? { type } : {}),
        limit: PAGE_SIZE,
      },
    }),
  byId: (id: string) => chatsControllerFindOneQueryKey({ path: { id } }),
  details: () => [{ _id: "chatsControllerFindOne" }] as const,
  histories: () => [{ _id: "chatsControllerMessages" }] as const,
  participantsAll: () => [{ _id: "chatsControllerParticipants" }] as const,
  messages: (id: string) =>
    chatsControllerMessagesInfiniteQueryKey({
      path: { id },
      query: { limit: HISTORY_PAGE_SIZE },
    }),
  participants: (id: string) =>
    chatsControllerParticipantsQueryKey({ path: { id } }),
};

export const chatQueries = {
  list: ({ archived = false, type }: ChatListFilters = {}) =>
    infiniteQueryOptions({
      ...chatsControllerListInfiniteOptions({
        query: {
          archived: String(archived),
          ...(type ? { type } : {}),
          limit: PAGE_SIZE,
        },
      }),
      initialPageParam: { query: {} },
      getNextPageParam: (last) =>
        last.nextCursor ? { query: { cursor: last.nextCursor } } : undefined,
    }),

  byId: (id: string) => chatsControllerFindOneOptions({ path: { id } }),

  messages: (id: string) =>
    infiniteQueryOptions({
      ...chatsControllerMessagesInfiniteOptions({
        path: { id },
        query: { limit: HISTORY_PAGE_SIZE },
      }),
      initialPageParam: { path: { id }, query: {} },
      structuralSharing: (previous, data) =>
        replaceEqualDeep(
          previous,
          withPendingMessages(id, data as InfiniteData<MessagePage>),
        ),
      getNextPageParam: (last) =>
        last.nextCursor
          ? { path: { id }, query: { cursor: last.nextCursor } }
          : undefined,
    }),

  participants: (id: string) =>
    chatsControllerParticipantsOptions({ path: { id } }),
};
