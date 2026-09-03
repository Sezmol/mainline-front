import { cn } from "@shared/lib/cn";

import { Button } from "./button";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  variant?: "block" | "inline";
  className?: string;
}

export const ErrorState = ({
  message,
  onRetry,
  variant = "block",
  className,
}: ErrorStateProps) => (
  <div
    className={cn(
      "flex flex-col gap-3",
      variant === "block"
        ? "border-destructive/40 bg-destructive-muted items-start rounded-lg border p-5"
        : "text-destructive items-center py-6 text-center",
      className,
    )}
    role="alert"
  >
    <p className="text-sm">{message}</p>

    {onRetry ? (
      <Button variant="outline" size="sm" onClick={onRetry}>
        Try again
      </Button>
    ) : null}
  </div>
);
