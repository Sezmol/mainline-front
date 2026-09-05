import { useState } from "react";

import { PencilLineIcon } from "@phosphor-icons/react";

import { Button } from "@shared/ui/button";

import type { PostFormValues } from "../model/post-form.schema";
import { PostFormDialog } from "./post-form-dialog";

interface CreatePostButtonProps {
  companyId?: string;
  label?: string;
  defaults?: { type?: PostFormValues["type"]; projectId?: string };
}

export const CreatePostButton = ({
  companyId,
  label = "New post",
  defaults,
}: CreatePostButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        size="sm"
        className="font-mono text-xs"
        onClick={() => setOpen(true)}
      >
        <PencilLineIcon className="size-3.5" />
        {label}
      </Button>

      <PostFormDialog
        open={open}
        onOpenChange={setOpen}
        companyId={companyId}
        defaults={defaults}
      />
    </>
  );
};
