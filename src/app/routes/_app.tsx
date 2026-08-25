import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
} from '@tanstack/react-router';

import { SignOutButton } from '@features/auth/sign-out';

import { loadSession } from '@entities/session';

const AppLayout = () => (
  <div className="min-h-dvh">
    <header className="border-border bg-background/80 sticky top-0 z-10 border-b backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-3">
        <Link
          to="/feed"
          className="font-mono text-base font-bold tracking-tight"
        >
          <span className="text-primary">$ </span>mainline
        </Link>
        <div className="ml-auto">
          <SignOutButton />
        </div>
      </div>
    </header>
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Outlet />
    </main>
  </div>
);

export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ context }) => {
    const session = await loadSession(context.queryClient);

    if (!session) {
      throw redirect({ to: '/login' });
    }

    return { session };
  },
  component: AppLayout,
});
