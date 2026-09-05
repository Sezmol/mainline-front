import { CommentLink } from "@features/post/comment";
import { DeletePostButton } from "@features/post/delete";
import { EditPostButton } from "@features/post/editor";
import { PostInteraction } from "@features/post/interact";
import { PostLikes } from "@features/post/like";
import { SavePostButton } from "@features/post/save-to-favorites";

import { isOptimistic, type Post } from "@entities/post";

export const postActions = (post: Post, viewerId?: string) => (
  <>
    <PostLikes post={post} />

    {isOptimistic(post) ? null : (
      <>
        <CommentLink post={post} />
        <SavePostButton post={post} />
      </>
    )}

    {post.author.id === viewerId && !isOptimistic(post) ? (
      <>
        <EditPostButton post={post} />
        <DeletePostButton post={post} />
      </>
    ) : null}
  </>
);

export const postInteraction = (post: Post) =>
  isOptimistic(post) ? null : <PostInteraction post={post} />;
