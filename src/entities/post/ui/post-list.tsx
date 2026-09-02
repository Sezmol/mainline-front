import { useInfiniteQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { useIntersection } from "@shared/lib/use-intersection";
import { Button } from "@shared/ui/button";
import { ErrorState } from "@shared/ui/error-state";
import { Skeleton } from "@shared/ui/skeleton";
import { Spinner } from "@shared/ui/spinner";

import { postQueries } from "../api/post.queries";
import type { FeedFilters, Post } from "../post.types";
import { PostCard } from "./post-card";

const SKELETON_ROWS = [0, 1, 2];

const PostSkeleton = () => (
  <div className="border-border bg-card flex flex-col gap-3 rounded-lg border p-5">
    <Skeleton className="h-9 w-40" />
    <Skeleton className="h-5 w-2/3" />
    <Skeleton className="h-24 w-full" />
  </div>
);

interface PostListProps {
  filters?: FeedFilters;
  emptyMessage?: string;
  endMessage?: string;
  renderActions?: (post: Post) => ReactNode;
  renderInteraction?: (post: Post) => ReactNode;
}

export const PostList = ({
  filters,
  emptyMessage = "Nothing here yet.",
  endMessage = "That is the whole feed.",
  renderActions,
  renderInteraction,
}: PostListProps) => {
  const feed = useInfiniteQuery(postQueries.feed(filters));

  const sentinelRef = useIntersection<HTMLButtonElement>(
    () => void feed.fetchNextPage(),
    feed.hasNextPage && !feed.isFetchingNextPage,
  );

  if (feed.isPending) {
    return (
      <div className="flex flex-col gap-4">
        {SKELETON_ROWS.map((row) => (
          <PostSkeleton key={row} />
        ))}
      </div>
    );
  }

  if (feed.isError) {
    return (
      <ErrorState
        message="The feed could not be loaded."
        onRetry={() => void feed.refetch()}
      />
    );
  }

  const posts = feed.data.pages.flatMap((page) => page.items);

  if (posts.length === 0) {
    return (
      <div className="border-border text-muted-foreground rounded-lg border border-dashed p-10 text-center text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          interaction={renderInteraction?.(post)}
          actions={renderActions?.(post)}
        />
      ))}

      {feed.hasNextPage ? (
        <Button
          ref={sentinelRef}
          variant="outline"
          className="font-mono text-xs"
          disabled={feed.isFetchingNextPage}
          onClick={() => void feed.fetchNextPage()}
        >
          {feed.isFetchingNextPage ? (
            <>
              <Spinner />
              Loading
            </>
          ) : (
            "Load older posts"
          )}
        </Button>
      ) : (
        <p className="text-muted-foreground py-4 text-center font-mono text-xs">
          {endMessage}
        </p>
      )}
    </div>
  );
};
