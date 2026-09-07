import { useState } from "react";

import { SignOutIcon, UserMinusIcon } from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";

import type { Member } from "@entities/company";

import { Button } from "@shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shared/ui/dialog";

import { useRemoveMember } from "../model/use-remove-member";

interface RemoveMemberButtonProps {
  companyId: string;
  slug: string;
  member: Member;
  leaving?: boolean;
}

export const RemoveMemberButton = ({
  companyId,
  slug,
  member,
  leaving,
}: RemoveMemberButtonProps) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const remove = useRemoveMember(companyId, slug);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-destructive font-mono text-xs"
        onClick={() => setOpen(true)}
      >
        {leaving ? (
          <SignOutIcon className="size-3.5" />
        ) : (
          <UserMinusIcon className="size-3.5" />
        )}
        {leaving ? "Leave" : "Remove"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {leaving
                ? "Leave this company?"
                : `Remove @${member.user.nickname}?`}
            </DialogTitle>
            <DialogDescription>
              {leaving ? "You" : "They"} will lose access to the company chat
              and to the chats of every department and team here. Any team{" "}
              {leaving ? "you lead" : "they lead"} will be disbanded along with
              its chat.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setOpen(false);
                remove.mutate(member.user.id, {
                  onSuccess: () => {
                    if (leaving) void navigate({ to: "/companies" });
                  },
                });
              }}
            >
              {leaving ? "Leave" : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
