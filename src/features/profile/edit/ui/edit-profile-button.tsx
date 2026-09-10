import { useState } from "react";

import { PencilIcon } from "@phosphor-icons/react";

import type { Profile } from "@entities/user";

import { Button } from "@shared/ui/button";

import { ProfileFormDialog } from "./profile-form-dialog";

export const EditProfileButton = ({ profile }: { profile: Profile }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="font-mono text-xs"
        onClick={() => setOpen(true)}
      >
        <PencilIcon className="size-3.5" />
        Edit profile
      </Button>

      <ProfileFormDialog open={open} onOpenChange={setOpen} profile={profile} />
    </>
  );
};
