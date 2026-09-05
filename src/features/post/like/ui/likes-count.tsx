import { useState } from "react";

import type { Post } from "@entities/post";

import { Button } from "@shared/ui/button";

import { LikesDialog } from "./likes-dialog";

export const LikesCount = ({ post }: { post: Post }) => {
  const [open, setOpen] = useState(false);

  if (post.likeCount === 0) {
    return (
      <span className="text-muted-foreground px-1 font-mono text-xs tabular-nums">
        0
      </span>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        size="xs"
        aria-label={`Who liked this, ${post.likeCount}`}
        className="text-muted-foreground min-w-6 px-1 font-mono text-xs tabular-nums"
        onClick={() => setOpen(true)}
      >
        {post.likeCount}
      </Button>

      <LikesDialog post={post} open={open} onOpenChange={setOpen} />
    </>
  );
};
