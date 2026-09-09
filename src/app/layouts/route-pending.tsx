import { cn } from "@shared/lib/cn";
import { Skeleton } from "@shared/ui/skeleton";

import { useWideRoute } from "../model/use-wide-route";

const SKELETON_ROWS = [0, 1, 2];

export const RoutePending = () => (
  <div className="flex w-full flex-col gap-3" role="status">
    <span className="sr-only">Loading</span>

    <Skeleton className="h-5 w-40" />

    {SKELETON_ROWS.map((row) => (
      <Skeleton key={row} className="h-24 w-full" />
    ))}
  </div>
);

export const PagePending = () => {
  const wide = useWideRoute();

  return (
    <div
      className={cn(
        "mx-auto w-full px-3 pt-6 pb-24 sm:px-4 sm:pt-8",
        wide ? "max-w-[100rem]" : "max-w-3xl",
      )}
    >
      <RoutePending />
    </div>
  );
};
