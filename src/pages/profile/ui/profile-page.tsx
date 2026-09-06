import { useQuery } from "@tanstack/react-query";

import { EditProfileButton } from "@features/profile/edit";

import { sessionQueries } from "@entities/session";
import { ProfileHeader, userQueries } from "@entities/user";

import { ErrorState } from "@shared/ui/error-state";
import { Skeleton } from "@shared/ui/skeleton";

import { profileRoute } from "../model/profile-route";
import { PortfolioSection } from "./portfolio-section";

const ProfileSkeleton = () => (
  <div className="border-border bg-card flex flex-col gap-3 rounded-lg border p-5">
    <Skeleton className="h-14 w-14 rounded-full" />
    <Skeleton className="h-5 w-48" />
    <Skeleton className="h-4 w-32" />
  </div>
);

export const ProfilePage = () => {
  const { nickname } = profileRoute.useParams();
  const profile = useQuery(userQueries.profile(nickname));
  const { data: viewer } = useQuery(sessionQueries.current());

  if (profile.isPending) return <ProfileSkeleton />;

  if (profile.isError) {
    return (
      <ErrorState
        message="This profile could not be loaded."
        onRetry={() => void profile.refetch()}
      />
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
