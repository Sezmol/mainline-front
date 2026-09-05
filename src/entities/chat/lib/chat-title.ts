import type { ChatView } from "../chat.types";

const KIND_LABELS = {
  private: "Direct",
  vacancy: "Vacancy",
  event: "Event",
  content: "Comments",
  task: "Task",
  favorites: "Saved",
  company: "Company",
  department: "Department",
  team: "Team",
  project: "Project",
} as const;

export const chatKindLabel = (view: ChatView) => KIND_LABELS[view.chat.type];

export const chatTitle = (view: ChatView) => {
  if (view.chat.type === "favorites") return "Favourites";

  if (view.chat.title) return view.chat.title;

  if (view.companion) {
    return `${view.companion.firstName} ${view.companion.lastName}`;
  }

  return view.chat.post?.title ?? "Chat";
};

export const chatPreview = (view: ChatView) => {
  if (!view.lastMessage) return "No messages yet";

  const { body, postId, author } = view.lastMessage;
  const text = body || (postId ? "Attached a post" : "");

  return view.chat.type === "private" || view.chat.type === "favorites"
    ? text
    : `@${author.nickname}: ${text}`;
};
