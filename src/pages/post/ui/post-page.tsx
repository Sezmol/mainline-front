import { ArrowLeftIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";

import { DeletePostButton } from "@features/post/delete";
import { EditPostButton } from "@features/post/editor";
import { PostInteraction } from "@features/post/interact";
import { PostLikes } from "@features/post/like";
import { SavePostButton } from "@features/post/save-to-favorites";

import { PostCard, postQueries } from "@entities/post";
import { sessionQueries } from "@entities/session";

import { Button } from "@shared/ui/button";
import { ErrorState } from "@shared/ui/error-state";
import { Skeleton } from "@shared/ui/skeleton";

import { postRoute } from "../model/post-route";
import { CommentThread } from "./comment-thread";
import { TaskPanel } from "./task-panel";

export const PostPage = () => {
  const { postId } = postRoute.useParams();
  const navigate = useNavigate();

  const post = useQuery(postQueries.byId(postId));
  const { data: viewer } = useQuery(sessionQueries.current());

  if (post.isPending) {
    return (
      <div className="border-border bg-card flex flex-col gap-3 rounded-lg border p-5">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (post.isError) {
    return (
      <ErrorState
        message="This post could not be loaded."
        onRetry={() => void post.refetch()}
      />
    );
  }

  const isAuthor = post.data.author.id === viewer?.id;

  return (
    <div className="flex flex-col gap-4">
      <Button
        variant="ghost"
        size="sm"
        nativeButton={false}
        className="text-muted-foreground -ml-2 self-start font-mono text-xs"
        render={<Link to="/feed" />}
      >
        <ArrowLeftIcon className="size-3.5" />
        Feed
      </Button>

      <PostCard
        post={post.data}
        interaction={<PostInteraction post={post.data} />}
        actions={
          <>
            <PostLikes post={post.data} />
            <SavePostButton post={post.data} />
            {isAuthor ? (
              <>
                <EditPostButton post={post.data} />
                <DeletePostButton
                  post={post.data}
                  onDeleted={() => void navigate({ to: "/feed" })}
                />
              </>
            ) : null}
          </>
        }
      />

      {post.data.type === "content" ? <CommentThread post={post.data} /> : null}

      {post.data.type === "task" ? <TaskPanel task={post.data} /> : null}
    </div>
  );
};
