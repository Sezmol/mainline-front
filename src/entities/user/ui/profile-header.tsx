import { BriefcaseIcon } from "lucide-react";
import type { ReactNode } from "react";

import { SPECIALITY_LABELS } from "@shared/config";
import { Avatar, AvatarFallback } from "@shared/ui/avatar";
import { Badge } from "@shared/ui/badge";

import type { Profile } from "../user.types";

const joined = new Intl.DateTimeFormat("en", {
  month: "long",
  year: "numeric",
});
interface ProfileHeaderProps {
  profile: Profile;
  actions?: ReactNode;
}

export const ProfileHeader = ({ profile, actions }: ProfileHeaderProps) => (
  <section className="border-border bg-card rounded-lg border">
    <div className="flex flex-wrap items-start gap-4 px-4 py-4 sm:px-5">
      <Avatar className="size-14 shrink-0">
        <AvatarFallback className="font-mono text-sm">
          {profile.firstName[0]}
          {profile.lastName[0]}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1 basis-40">
        <h1 className="truncate text-xl leading-tight font-semibold tracking-tight">
          {profile.firstName} {profile.lastName}
        </h1>
        <p className="text-muted-foreground truncate font-mono text-xs">
          @{profile.nickname}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="font-mono text-[11px]">
            {SPECIALITY_LABELS[profile.speciality]}
          </Badge>

          {profile.workplace ? (
            <span className="text-muted-foreground inline-flex min-w-0 items-center gap-1.5 font-mono text-[11px]">
              <BriefcaseIcon className="size-3 shrink-0" />
              <span className="truncate">{profile.workplace}</span>
            </span>
          ) : null}
        </div>
      </div>

      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </div>

    {profile.description ? (
      <div className="border-border border-t px-4 py-4 sm:px-5">
        <p className="text-body text-sm leading-relaxed whitespace-pre-wrap">
          {profile.description}
        </p>
      </div>
    ) : null}

    <footer className="border-border text-muted-foreground border-t px-4 py-2.5 font-mono text-xs sm:px-5">
      Joined {joined.format(new Date(profile.createdAt))}
    </footer>
  </section>
);
