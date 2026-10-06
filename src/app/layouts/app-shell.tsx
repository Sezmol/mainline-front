import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { NotificationBell } from "@features/notification/bell";
import { ThemeSwitch } from "@features/theme/switch";

import { sessionQueries } from "@entities/session";

import { cn } from "@shared/lib/cn";

import { useRealtime } from "../model/use-realtime";
import { useReloadOnAccountChange } from "../model/use-reload-on-account-change";
import { useWideRoute } from "../model/use-wide-route";
import { ChatDock } from "./chat-dock/chat-dock";
import { AccountMenu } from "./account-menu";

const NAV = [
  { to: "/feed", label: "Feed" },
  { to: "/companies", label: "Companies" },
  { to: "/projects", label: "Projects" },
  { to: "/board", label: "Board" },
] as const;

export const AppShell = ({ children }: { children: ReactNode }) => {
  const { data: user } = useQuery(sessionQueries.current());
  const wide = useWideRoute();

  useRealtime(user?.id);
  useReloadOnAccountChange(user?.id);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-border bg-background/80 sticky top-0 z-10 border-b backdrop-blur">
        <div className="mx-auto flex w-full max-w-[100rem] flex-wrap items-center gap-2 px-3 py-3 sm:gap-6 sm:px-4">
          <Link
            to="/feed"
            className="shrink-0 font-mono text-base font-bold tracking-tight"
          >
            <span className="text-primary-ink">$ </span>mainline
          </Link>

          <nav className="order-last -mx-1 flex w-full items-center gap-1 overflow-x-auto px-1 sm:order-none sm:mx-0 sm:w-auto sm:overflow-visible sm:px-0">
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
            {user ? <NotificationBell /> : null}

            <ThemeSwitch />

            {user ? <AccountMenu user={user} /> : null}
          </div>
        </div>
      </header>

      <main
        className={cn(
          "mx-auto w-full flex-1 px-3 pt-6 pb-24 sm:px-4 sm:pt-8",
          wide ? "max-w-[100rem]" : "max-w-3xl",
        )}
      >
        {children}
      </main>

      <ChatDock />
    </div>
  );
};
