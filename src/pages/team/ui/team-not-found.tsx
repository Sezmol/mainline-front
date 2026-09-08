import { Link } from "@tanstack/react-router";

import { Button } from "@shared/ui/button";

export const TeamNotFound = () => (
  <div className="border-border flex flex-col items-start gap-3 rounded-lg border border-dashed p-10">
    <h1 className="text-base font-semibold">No such team</h1>
    <p className="text-muted-foreground text-sm">
      It may have been disbanded, or it was never yours to see.
    </p>
    <Button
      variant="outline"
      size="sm"
      nativeButton={false}
      render={<Link to="/feed" />}
    >
      Back to the feed
    </Button>
  </div>
);
