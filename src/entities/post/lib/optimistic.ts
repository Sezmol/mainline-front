import type { Post } from "../post.types";

const OPTIMISTIC_PREFIX = "optimistic-";

export const optimisticPostId = () =>
  `${OPTIMISTIC_PREFIX}${crypto.randomUUID()}`;

export const isOptimistic = (post: Post) =>
  post.id.startsWith(OPTIMISTIC_PREFIX);
