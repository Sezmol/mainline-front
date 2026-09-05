import { HeartIcon } from "@phosphor-icons/react";

import type { Post } from "@entities/post";

import { cn } from "@shared/lib/cn";
import { Button } from "@shared/ui/button";

import { useToggleLike } from "../model/use-toggle-like";

export const LikeButton = ({ post }: { post: Post }) => {
  const toggleLike = useToggleLike(post);

  return (
    <Button
      variant="ghost"
      size="icon-xs"
      aria-pressed={post.likedByMe}
      aria-label={post.likedByMe ? "Remove like" : "Like"}
      className="text-muted-foreground"
      onClick={toggleLike}
    >
      <HeartIcon
        weight={post.likedByMe ? "fill" : "regular"}
        className={cn("size-4", post.likedByMe && "text-primary")}
      />
    </Button>
  );
};
