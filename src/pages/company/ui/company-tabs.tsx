import { Link } from "@tanstack/react-router";

import { cn } from "@shared/lib/cn";

import { type CompanyTab } from "../model/company-search";

const TABS = [
  { id: "overview", label: "Overview", memberOnly: false },
  { id: "posts", label: "Posts", memberOnly: false },
  { id: "people", label: "People", memberOnly: true },
  { id: "structure", label: "Structure", memberOnly: true },
] as const;

interface CompanyTabsProps {
  current: CompanyTab;
  slug: string;
  member: boolean;
}

export const CompanyTabs = ({ current, slug, member }: CompanyTabsProps) => (
  <nav className="border-border flex flex-wrap gap-1 border-b pb-2">
    {TABS.filter((tab) => member || !tab.memberOnly).map((tab) => (
      <Link
        key={tab.id}
        to="/c/$slug"
        params={{ slug }}
        search={{ tab: tab.id }}
        className={cn(
          "rounded-md px-2.5 py-1.5 font-mono text-xs tracking-wide transition-colors",
          current === tab.id
            ? "text-foreground bg-elevated"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {tab.label}
      </Link>
    ))}
  </nav>
);
