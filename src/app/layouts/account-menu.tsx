import {
  EnvelopeSimpleIcon,
  SignOutIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";

import { useSignOutAction } from "@features/auth/sign-out";

import type { SessionUser } from "@entities/session";

import { Avatar, AvatarFallback } from "@shared/ui/avatar";
import { Button } from "@shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shared/ui/dropdown-menu";

export const AccountMenu = ({ user }: { user: SessionUser }) => {
  const { signOut, isPending } = useSignOutAction();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Account"
            className="rounded-full p-0"
          />
        }
      >
        <Avatar className="size-7" aria-hidden>
          <AvatarFallback className="font-mono text-[10px]">
            {user.firstName[0]}
            {user.lastName[0]}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <div className="px-1.5 py-1">
          <p className="truncate text-sm font-medium">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-muted-foreground truncate font-mono text-xs">
            @{user.nickname}
          </p>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          render={
            <Link to="/u/$nickname" params={{ nickname: user.nickname }} />
          }
        >
          <UserIcon />
          Profile
        </DropdownMenuItem>

        <DropdownMenuItem render={<Link to="/invites" />}>
          <EnvelopeSimpleIcon />
          Invitations
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem disabled={isPending} onClick={signOut}>
          <SignOutIcon />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
