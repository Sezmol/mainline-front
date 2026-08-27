import { Link } from "@tanstack/react-router";

import { Button } from "@shared/ui/button";

import { projectRoute } from "../model/project-route";
export const ProjectNotFound = () => {
  const { nickname } = projectRoute.useParams();
  return (
    <div className="border-border flex flex-col items-center gap-4 rounded-lg border border-dashed p-12 text-center">
      <p className="font-mono text-sm">This project is gone.</p>
      <p className="text-muted-foreground text-sm">
        It was deleted, or the link points at the wrong portfolio.
      </p>
      <Button
        variant="outline"
        size="sm"
        nativeButton={false}
        render={<Link to="/u/$nickname" params={{ nickname }} />}
      >
        @{nickname}
      </Button>
    </div>
  );
};
