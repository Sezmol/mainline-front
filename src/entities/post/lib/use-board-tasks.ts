import { useEffect } from "react";

import { useInfiniteQuery } from "@tanstack/react-query";

import { postQueries } from "../api/post.queries";
import type { FeedFilters, Post } from "../post.types";

type Task = Extract<Post, { type: "task" }>;

const isTask = (post: Post): post is Task => post.type === "task";

export const useBoardTasks = (filters: FeedFilters, enabled = true) => {
  const query = useInfiniteQuery({ ...postQueries.feed(filters), enabled });

  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;

  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const tasks = (query.data?.pages ?? [])
    .flatMap((page) => page.items)
    .filter(isTask);

  return { ...query, tasks };
};
