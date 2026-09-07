import { Link } from "@tanstack/react-router";

import { cn } from "@shared/lib/cn";

import { SETTINGS_TABS, type SettingsTab } from "../model/settings-search";

const LABELS: Record<SettingsTab, string> = {
  profile: "Profile",
  people: "People",
  departments: "Departments",
  teams: "Teams",
};

interface SettingsTabsProps {
  current: SettingsTab;
  slug: string;
}

export const SettingsTabs = ({ current, slug }: SettingsTabsProps) => (
  <nav className="border-border flex flex-wrap gap-1 border-b pb-2">
    {SETTINGS_TABS.map((tab) => (
      <Link
        key={tab}
        to="/c/$slug/settings"
        params={{ slug }}
        search={{ tab }}
        className={cn(
          "rounded-md px-2.5 py-1.5 font-mono text-xs tracking-wide transition-colors",
          current === tab
            ? "text-foreground bg-elevated"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {LABELS[tab]}
      </Link>
    ))}
  </nav>
);
