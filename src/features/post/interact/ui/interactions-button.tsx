import { useState } from "react";

import { UsersIcon } from "@phosphor-icons/react";

import type { Post } from "@entities/post";

import { Button } from "@shared/ui/button";

import { InteractionStrip } from "./interaction-strip";
import { InteractionsDialog } from "./interactions-dialog";

export const InteractionsButton = ({ post }: { post: Post }) => {
  const [open, setOpen] = useState(false);

  return (
    <InteractionStrip>
      <Button
        variant="outline"
        size="sm"
        className="font-mono text-xs"
        onClick={() => setOpen(true)}
      >
        <UsersIcon />
        {post.type === "event" ? "Participants" : "Responses"}
      </Button>

      <InteractionsDialog post={post} open={open} onOpenChange={setOpen} />
    </InteractionStrip>
  );
};
