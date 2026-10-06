import { useRef, useState } from "react";

import { PaperPlaneRightIcon } from "@phosphor-icons/react";

import { Button } from "@shared/ui/button";
import { Textarea } from "@shared/ui/textarea";

import { useSendMessage } from "../model/use-send-message";

interface MessageInputProps {
  chatId: string;
  canWrite: boolean;
  restricted: boolean;
}

export const MessageInput = ({
  chatId,
  canWrite,
  restricted,
}: MessageInputProps) => {
  const [body, setBody] = useState("");
  const field = useRef<HTMLTextAreaElement>(null);
  const send = useSendMessage(chatId);

  if (!canWrite) {
    return (
      <p className="text-muted-foreground border-border border-t px-3 py-4 text-center font-mono text-xs">
        {restricted
          ? "The author has closed this chat for writing."
          : "You cannot write in this chat."}
      </p>
    );
  }

  const submit = () => {
    const text = body.trim();
    if (!text) return;

    setBody("");
    send.mutate({ id: crypto.randomUUID(), body: text });
    field.current?.focus();
  };

  return (
    <form
      className="border-border flex items-end gap-2 border-t px-3 py-2.5"
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
        placeholder="Write a message. Markdown works."
        aria-label="Message"
        className="field-sizing-content max-h-32 min-h-9 flex-1 resize-none leading-5"
      />

      <Button
        type="submit"
        size="icon-lg"
        aria-label="Send"
        disabled={body.trim().length === 0}
      >
        <PaperPlaneRightIcon />
      </Button>
    </form>
  );
};
