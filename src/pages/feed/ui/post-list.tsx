import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";

import { DeletePostButton } from "@features/post/delete";
import { EditPostButton, isOptimistic } from "@features/post/editor";
import { LikeButton } from "@features/post/like";

import { type FeedFilters, PostCard, postQueries } from "@entities/post";
import { sessionQueries } from "@entities/session";

import { useIntersection } from "@shared/lib/use-intersection";
import { Button } from "@shared/ui/button";

const SKELETON_ROWS = [0, 1, 2];

const PostSkeleton = () => (
  <div className="border-border bg-card flex flex-col gap-3 rounded-lg border p-5">
    <div className="bg-elevated h-9 w-40 animate-pulse rounded" />
    <div className="bg-elevated h-5 w-2/3 animate-pulse rounded" />
    <div className="bg-elevated h-24 w-full animate-pulse rounded" />
  </div>
);

interface PostListProps {
  filters?: FeedFilters;
}

export const PostList = ({ filters }: PostListProps) => {
  const feed = useInfiniteQuery(postQueries.feed(filters));
  const { data: user } = useQuery(sessionQueries.current());

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
      <div className="border-destructive/40 bg-destructive-muted flex flex-col items-start gap-3 rounded-lg border p-5">
        <p className="text-sm">The feed could not be loaded.</p>
        <Button variant="outline" size="sm" onClick={() => void feed.refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  const posts = feed.data.pages.flatMap((page) => page.items);

  if (posts.length === 0) {
    return (
      <div className="border-border text-muted-foreground rounded-lg border border-dashed p-10 text-center text-sm">
        Nothing here yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          actions={
            <>
              <LikeButton post={post} />
              {post.author.id === user?.id && !isOptimistic(post) ? (
                <>
                  <EditPostButton post={post} />
                  <DeletePostButton post={post} />
                </>
              ) : null}
            </>
          }
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
              <Loader2Icon className="animate-spin" />
              Loading
            </>
          ) : (
            "Load older posts"
          )}
        </Button>
      ) : (
        <p className="text-muted-foreground py-4 text-center font-mono text-xs">
          That is the whole feed.
        </p>
      )}
    </div>
  );
};
