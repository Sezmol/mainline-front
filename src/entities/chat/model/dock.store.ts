import { create } from "zustand";

import type { ChatFilter } from "../chat.types";

interface DockState {
  isOpen: boolean;
  isFullscreen: boolean;
  activeChatId: string | null;
  filter: ChatFilter;
  anchorByChat: Record<string, string | null>;
  open: () => void;
  close: () => void;
  toggleFullscreen: () => void;
  setFilter: (filter: ChatFilter) => void;
  openChat: (chatId: string) => void;
  backToList: () => void;
  forget: (chatId: string) => void;
  rememberAnchor: (chatId: string, messageId: string | null) => void;
}

export const useDockStore = create<DockState>((set) => ({
  isOpen: false,
  isFullscreen: false,
  activeChatId: null,
  filter: "chats",
  anchorByChat: {},

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggleFullscreen: () =>
    set((state) => ({ isFullscreen: !state.isFullscreen })),
  setFilter: (filter) => set({ filter }),
  openChat: (chatId) => set({ isOpen: true, activeChatId: chatId }),
  backToList: () => set({ activeChatId: null }),

  forget: (chatId) =>
    set((state) => ({
      activeChatId: state.activeChatId === chatId ? null : state.activeChatId,
      anchorByChat: Object.fromEntries(
        Object.entries(state.anchorByChat).filter(([id]) => id !== chatId),
      ),
    })),

  rememberAnchor: (chatId, messageId) =>
    set((state) => ({
      anchorByChat: { ...state.anchorByChat, [chatId]: messageId },
    })),
}));
