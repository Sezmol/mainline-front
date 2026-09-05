import type { Post } from "@entities/post";

export const seatsTaken = (post: Post) =>
  post.type === "event" ? post.acceptedCount + 1 : post.acceptedCount;

export const isFull = (post: Post) =>
  post.type === "event" &&
  post.participantLimit !== null &&
  seatsTaken(post) >= post.participantLimit;
