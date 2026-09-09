import { Link } from "@tanstack/react-router";

import { Button } from "@shared/ui/button";

export const ProjectNotFound = () => (
  <div className="border-border flex flex-col items-start gap-3 rounded-lg border border-dashed p-10">
    <h1 className="text-base font-semibold">No such project</h1>
    <p className="text-muted-foreground text-sm">
      It may have been deleted, or it belongs to a team you are not in.
    </p>
    <Button
      variant="outline"
      size="sm"
      nativeButton={false}
      render={<Link to="/projects" />}
    >
      Back to projects
    </Button>
  </div>
);
