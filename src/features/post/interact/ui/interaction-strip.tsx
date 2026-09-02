import type { ReactNode } from "react";

import { cn } from "@shared/lib/cn";

export const InteractionStrip = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => (
  <div
    className={cn(
      "border-border flex flex-wrap items-center gap-2 border-t px-4 py-2.5 sm:px-5",
      className,
    )}
  >
    {children}
  </div>
);

export const InteractionStatus = ({
  icon,
  children,
  tone = "muted",
}: {
  icon: ReactNode;
  children: ReactNode;
  tone?: "muted" | "positive";
}) => (
  <p
    className={cn(
      "flex items-center gap-1.5 font-mono text-xs",
      tone === "positive" ? "text-primary-ink" : "text-muted-foreground",
    )}
  >
    {icon}
    {children}
  </p>
);
