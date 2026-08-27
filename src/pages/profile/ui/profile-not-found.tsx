import { Link } from "@tanstack/react-router";

import { Button } from "@shared/ui/button";

import { profileRoute } from "../model/profile-route";

export const ProfileNotFound = () => {
  const { nickname } = profileRoute.useParams();

  return (
    <div className="border-border flex flex-col items-center gap-4 rounded-lg border border-dashed p-12 text-center">
      <p className="font-mono text-sm">
        Nobody goes by <span className="text-primary-ink">@{nickname}</span>.
      </p>
      <p className="text-muted-foreground text-sm">
        The nickname may have changed, or the account is gone.
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
};
