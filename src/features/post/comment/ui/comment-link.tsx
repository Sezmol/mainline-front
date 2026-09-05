import { ChatIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";

import type { Post } from "@entities/post";

import { Button } from "@shared/ui/button";

export const CommentLink = ({ post }: { post: Post }) => {
  if (post.type !== "content") return null;

  const counted = post.commentCount > 0;

  return (
    <Button
      variant="ghost"
      size="sm"
      nativeButton={false}
      aria-label={counted ? `Comments, ${post.commentCount}` : "Comment"}
      className="-ml-2 font-mono text-xs"
      render={
        <Link to="/p/$postId" params={{ postId: post.id }} hash="comments" />
      }
    >
      <ChatIcon className="size-4" />
      <span className="tabular-nums">
        {counted ? post.commentCount : "Comment"}
      </span>
    </Button>
  );
};
