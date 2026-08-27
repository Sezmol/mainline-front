import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { SignOutButton } from "@features/auth/sign-out";
import { ThemeSwitch } from "@features/theme/switch";

import { sessionQueries } from "@entities/session";

import { Avatar, AvatarFallback } from "@shared/ui/avatar";

const NAV = [{ to: "/feed", label: "Feed" }] as const;

export const AppShell = ({ children }: { children: ReactNode }) => {
  const { data: user } = useQuery(sessionQueries.current());

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-border bg-background/80 sticky top-0 z-10 border-b backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-3 py-3 sm:gap-6 sm:px-4">
          <Link
            to="/feed"
            className="shrink-0 font-mono text-base font-bold tracking-tight"
          >
            <span className="text-primary-ink">$ </span>mainline
          </Link>

          <nav className="flex items-center gap-1">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-muted-foreground hover:text-foreground rounded-md px-2.5 py-1.5 font-mono text-xs tracking-wide transition-colors"
                activeProps={{
                  className: "text-foreground bg-elevated",
                  "aria-current": "page",
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
            <ThemeSwitch />

            {user ? (
              <Link
                to="/u/$nickname"
                params={{ nickname: user.nickname }}
                aria-label="Your profile"
                className="group/me flex items-center gap-2"
              >
                <Avatar className="size-7">
                  <AvatarFallback className="font-mono text-[10px]">
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-muted-foreground group-hover/me:text-foreground hidden font-mono text-xs transition-colors sm:inline">
                  @{user.nickname}
                </span>
              </Link>
            ) : null}

            <SignOutButton />
          </div>
        </div>
      </header>

      {/* The chat dock of module 2 attaches to this column, not inside main. */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-3 py-6 sm:px-4 sm:py-8">
        {children}
      </main>
    </div>
  );
};
