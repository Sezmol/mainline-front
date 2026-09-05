import { useState } from "react";

import { PencilIcon } from "@phosphor-icons/react";

import type { Post } from "@entities/post";

import { Button } from "@shared/ui/button";

import { PostFormDialog } from "./post-form-dialog";

export const EditPostButton = ({ post }: { post: Post }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        aria-label="Edit post"
        className="text-muted-foreground font-mono text-xs"
        onClick={() => setOpen(true)}
      >
        <PencilIcon className="size-3.5" />
        Edit
      </Button>

      <PostFormDialog open={open} onOpenChange={setOpen} post={post} />
    </>
  );
};
