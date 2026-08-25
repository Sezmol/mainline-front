import { useNavigate } from '@tanstack/react-router';
import { LogOutIcon } from 'lucide-react';

import { useSignOut } from '@features/auth/model';

import { Button } from '@shared/ui/button';

export const SignOutButton = () => {
  const navigate = useNavigate();
  const signOut = useSignOut();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={signOut.isPending}
      onClick={() => {
        signOut.mutate(undefined, {
          onSettled: () => {
            void navigate({ to: '/login' });
          },
        });
      }}
    >
      <LogOutIcon />
      Sign out
    </Button>
  );
};
