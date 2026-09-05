import { Link } from "@tanstack/react-router";

import { Button } from "@shared/ui/button";

export const PostNotFound = () => (
  <div className="border-border flex flex-col items-center gap-4 rounded-lg border border-dashed p-12 text-center">
    <p className="font-mono text-sm">This post is gone.</p>
    <p className="text-muted-foreground text-sm">
      Its author deleted it, or the link points at nothing.
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
