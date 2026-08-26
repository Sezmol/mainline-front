import { lazy, Suspense } from "react";

import { cn } from "@shared/lib/cn";

const MarkdownBody = lazy(() => import("./markdown-body"));

interface MarkdownProps {
  children: string;
  className?: string;
}

export const Markdown = ({ children, className }: MarkdownProps) => (
  <div className={cn("markdown", className)}>
    <Suspense
      fallback={<p className="text-body whitespace-pre-wrap">{children}</p>}
    >
      <MarkdownBody>{children}</MarkdownBody>
    </Suspense>
  </div>
);
