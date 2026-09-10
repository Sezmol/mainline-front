import { MonitorIcon, MoonIcon, SunIcon } from "@phosphor-icons/react";
import { useTheme } from "next-themes";

import { cn } from "@shared/lib/cn";
import { Button } from "@shared/ui/button";

const OPTIONS = [
  { value: "light", label: "Light theme", Icon: SunIcon },
  { value: "dark", label: "Dark theme", Icon: MoonIcon },
  { value: "system", label: "Match the system", Icon: MonitorIcon },
] as const;

export const ThemeSwitch = ({ className }: { className?: string }) => {
  const { theme, setTheme } = useTheme();

  return (
    <div
      aria-label="Theme"
      className={cn(
        "border-border flex items-center rounded-lg border p-0.5",
        className,
      )}
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = theme === value;

        return (
          <Button
            key={value}
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            aria-pressed={active}
            title={label}
            className={cn(
              "text-muted-foreground hover:text-foreground rounded-md",
              active && "bg-elevated text-foreground",
            )}
            onClick={() => {
              setTheme(value);
            }}
          >
            <Icon />
          </Button>
        );
      })}
    </div>
  );
};
