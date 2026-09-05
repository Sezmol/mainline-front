import { useQuery } from "@tanstack/react-query";

import { DeletePostButton } from "@features/post/delete";
import { EditPostButton } from "@features/post/editor";
import { PostLikes } from "@features/post/like";

import { PostCard, postQueries } from "@entities/post";
import { sessionQueries } from "@entities/session";

export const AttachedPost = ({ postId }: { postId: string }) => {
  const post = useQuery(postQueries.byId(postId));
  const { data: user } = useQuery(sessionQueries.current());

  if (post.isPending) {
    return (
      <p className="text-muted-foreground font-mono text-xs">
        Loading the post…
      </p>
    );
  }

  if (post.isError) {
    return (
      <p className="text-muted-foreground font-mono text-xs">
        That post is gone.
      </p>
    );
  }

  return (
    <PostCard
      post={post.data}
      actions={
        <>
          <PostLikes post={post.data} />
          {post.data.author.id === user?.id ? (
            <>
              <EditPostButton post={post.data} />
              <DeletePostButton post={post.data} />
            </>
          ) : null}
        </>
      }
    />
  );
};
