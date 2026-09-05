import { BookmarkSimpleIcon } from "@phosphor-icons/react";

import type { Post } from "@entities/post";

import { cn } from "@shared/lib/cn";
import { Button } from "@shared/ui/button";

import { useToggleSave } from "../model/use-toggle-save";

export const SavePostButton = ({ post }: { post: Post }) => {
  const { toggle, isPending } = useToggleSave(post);

  return (
    <Button
      variant="ghost"
      size="sm"
      className="font-mono text-xs"
      disabled={isPending}
      aria-pressed={post.savedByMe}
      title={post.savedByMe ? "Remove from Favourites" : "Save to Favourites"}
      onClick={toggle}
    >
      <BookmarkSimpleIcon
        weight={post.savedByMe ? "fill" : "regular"}
        className={cn("size-4", post.savedByMe && "text-primary")}
      />
      {post.savedByMe ? "Saved" : "Save"}
    </Button>
  );
};
