import type { Post } from "@entities/post";

import { LikeButton } from "./like-button";
import { LikesCount } from "./likes-count";

export const PostLikes = ({ post }: { post: Post }) => (
  <div className="-ml-0.5 flex items-center">
    <LikeButton post={post} />
    <LikesCount post={post} />
  </div>
);
