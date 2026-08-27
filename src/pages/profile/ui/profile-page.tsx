import { useQuery } from "@tanstack/react-query";

import { EditProfileButton } from "@features/profile/edit";

import { sessionQueries } from "@entities/session";
import { ProfileHeader, userQueries } from "@entities/user";

import { Button } from "@shared/ui/button";

import { profileRoute } from "../model/profile-route";
import { PortfolioSection } from "./portfolio-section";

const ProfileSkeleton = () => (
  <div className="border-border bg-card flex flex-col gap-3 rounded-lg border p-5">
    <div className="bg-elevated h-14 w-14 animate-pulse rounded-full" />
    <div className="bg-elevated h-5 w-48 animate-pulse rounded" />
    <div className="bg-elevated h-4 w-32 animate-pulse rounded" />
  </div>
);

export const ProfilePage = () => {
  const { nickname } = profileRoute.useParams();
  const profile = useQuery(userQueries.profile(nickname));
  const { data: viewer } = useQuery(sessionQueries.current());

  if (profile.isPending) return <ProfileSkeleton />;

  if (profile.isError) {
    return (
      <div className="border-destructive/40 bg-destructive-muted flex flex-col items-start gap-3 rounded-lg border p-5">
        <p className="text-sm">This profile could not be loaded.</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void profile.refetch()}
        >
          Try again
        </Button>
      </div>
    );
  }

  const owned = viewer?.id === profile.data.id;

  return (
    <div className="flex flex-col gap-8">
      <ProfileHeader
        profile={profile.data}
        actions={owned ? <EditProfileButton profile={profile.data} /> : null}
      />

      <PortfolioSection userId={profile.data.id} owned={owned} />
    </div>
  );
};
