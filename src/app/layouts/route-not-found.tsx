import { Link } from "@tanstack/react-router";

import { Button } from "@shared/ui/button";

export const RouteNotFound = () => (
  <div className="mx-auto w-full max-w-3xl p-4">
    <div className="border-border flex flex-col items-center gap-4 rounded-lg border border-dashed p-12 text-center">
      <p className="text-muted-foreground font-mono text-xs tracking-widest">
        404
      </p>
      <p className="font-mono text-sm">There is nothing at this address.</p>
      <Button
        variant="outline"
        size="sm"
        nativeButton={false}
        render={<Link to="/feed" />}
      >
        Back to the feed
      </Button>
    </div>
  </div>
);
