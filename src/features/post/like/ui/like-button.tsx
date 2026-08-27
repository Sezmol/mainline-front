import { HeartIcon } from "lucide-react";

import type { Post } from "@entities/post";

import { cn } from "@shared/lib/cn";
import { Button } from "@shared/ui/button";

import { useToggleLike } from "../model/use-toggle-like";

export const LikeButton = ({ post }: { post: Post }) => {
  const toggleLike = useToggleLike(post);

  return (
    <Button
      variant="ghost"
      size="sm"
      aria-pressed={post.likedByMe}
      aria-label={post.likedByMe ? "Remove like" : "Like"}
      className="text-muted-foreground -ml-2 gap-1.5 font-mono text-xs tabular-nums"
      onClick={toggleLike}
    >
      <HeartIcon
        className={cn(
          "size-4",
          post.likedByMe && "fill-primary text-primary-ink",
        )}
      />
      {post.likeCount}
    </Button>
  );
};
