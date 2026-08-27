import { useState } from "react";

import { PenLineIcon } from "lucide-react";

import { Button } from "@shared/ui/button";

import { PostFormDialog } from "./post-form-dialog";

export const CreatePostButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        size="sm"
        className="font-mono text-xs"
        onClick={() => setOpen(true)}
      >
        <PenLineIcon className="size-3.5" />
        New post
      </Button>

      <PostFormDialog open={open} onOpenChange={setOpen} />
    </>
  );
};
