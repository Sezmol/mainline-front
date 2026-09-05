import { useRef, useState } from "react";

import { PaperPlaneRightIcon } from "@phosphor-icons/react";

import { useComment } from "@features/post/comment";

import { Button } from "@shared/ui/button";
import { Textarea } from "@shared/ui/textarea";

interface CommentComposerProps {
  postId: string;
  chatId: string | null;
}

export const CommentComposer = ({ postId, chatId }: CommentComposerProps) => {
  const [body, setBody] = useState("");
  const field = useRef<HTMLTextAreaElement>(null);
  const comment = useComment(postId, chatId);

  const submit = () => {
    const text = body.trim();
    if (!text || comment.isPending) return;

    setBody("");
    comment.mutate(text);
    field.current?.focus();
  };

  return (
    <form
      className="flex items-end gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <Textarea
        ref={field}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submit();
          }
        }}
        rows={1}
        placeholder="Comment. Markdown works."
        aria-label="Comment"
        className="field-sizing-content max-h-40 min-h-9 flex-1 resize-none leading-5"
      />

      <Button
        type="submit"
        size="icon-lg"
        aria-label="Send comment"
        disabled={comment.isPending || body.trim().length === 0}
      >
        <PaperPlaneRightIcon />
      </Button>
    </form>
  );
};
