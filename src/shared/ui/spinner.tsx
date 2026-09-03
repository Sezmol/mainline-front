import * as React from "react";

import { SpinnerGapIcon } from "@phosphor-icons/react";

import { cn } from "@shared/lib/cn";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <SpinnerGapIcon
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn("animate-spin", className)}
      {...props}
    />
  );
}

export { Spinner };
