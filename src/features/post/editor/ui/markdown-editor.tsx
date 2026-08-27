import { useRef, useState } from "react";

import {
  BoldIcon,
  CodeIcon,
  Heading2Icon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
} from "lucide-react";

import { cn } from "@shared/lib/cn";
import { Button } from "@shared/ui/button";
import { Markdown } from "@shared/ui/markdown";

interface MarkdownEditorProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  limit: number;
  invalid?: boolean;
}

const WRAPS = [
  { icon: BoldIcon, label: "Bold", before: "**", after: "**" },
  { icon: ItalicIcon, label: "Italic", before: "*", after: "*" },
  { icon: CodeIcon, label: "Code", before: "`", after: "`" },
  { icon: LinkIcon, label: "Link", before: "[", after: "](https://)" },
];

const PREFIXES = [
  { icon: Heading2Icon, label: "Heading", prefix: "## " },
  { icon: ListIcon, label: "List", prefix: "- " },
];

export const MarkdownEditor = ({
  id,
  value,
  onChange,
  limit,
  invalid,
}: MarkdownEditorProps) => {
  const [preview, setPreview] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  const edit = (next: string, from: number, to: number) => {
    onChange(next);
    requestAnimationFrame(() => {
      ref.current?.focus();
      ref.current?.setSelectionRange(from, to);
    });
  };

  const wrap = (before: string, after: string) => {
    const textarea = ref.current;
    if (!textarea) return;

    const { selectionStart: start, selectionEnd: end } = textarea;
    const selected = value.slice(start, end);

    edit(
      `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`,
      start + before.length,
      start + before.length + selected.length,
    );
  };

  const prefixLine = (prefix: string) => {
    const textarea = ref.current;
    if (!textarea) return;

    const { selectionStart: start } = textarea;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;

    edit(
      `${value.slice(0, lineStart)}${prefix}${value.slice(lineStart)}`,
      start + prefix.length,
      start + prefix.length,
    );
  };

  const over = value.length > limit;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1">
        {WRAPS.map((action) => (
          <Button
            key={action.label}
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label={action.label}
            disabled={preview}
            onClick={() => wrap(action.before, action.after)}
          >
            <action.icon className="size-4" />
          </Button>
        ))}

        {PREFIXES.map((action) => (
          <Button
            key={action.label}
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label={action.label}
            disabled={preview}
            onClick={() => prefixLine(action.prefix)}
          >
            <action.icon className="size-4" />
          </Button>
        ))}

        <div className="ml-auto flex items-center gap-1">
          <Button
            type="button"
            variant={preview ? "ghost" : "secondary"}
            size="sm"
            className="font-mono text-xs"
            onClick={() => setPreview(false)}
          >
            Write
          </Button>
          <Button
            type="button"
            variant={preview ? "secondary" : "ghost"}
            size="sm"
            className="font-mono text-xs"
            onClick={() => setPreview(true)}
          >
            Preview
          </Button>
        </div>
      </div>

      {preview ? (
        <div className="border-input bg-card min-h-56 rounded-md border px-3 py-2">
          {value.trim() ? (
            <Markdown>{value}</Markdown>
          ) : (
            <p className="text-muted-foreground text-sm">Nothing to preview.</p>
          )}
        </div>
      ) : (
        <textarea
          id={id}
          ref={ref}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={invalid ?? over}
          placeholder="Markdown is welcome: **bold**, `code`, ```blocks```"
          className={cn(
            "border-input bg-card min-h-56 w-full resize-y rounded-md border px-3 py-2",
            "font-mono text-sm leading-relaxed",
            "aria-[invalid=true]:border-destructive",
          )}
        />
      )}

      <p
        className={cn(
          "text-muted-foreground text-right font-mono text-xs tabular-nums",
          over && "text-destructive",
        )}
      >
        {value.length} / {limit}
      </p>
    </div>
  );
};
