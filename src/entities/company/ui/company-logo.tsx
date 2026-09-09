import { cn } from "@shared/lib/cn";

interface CompanyLogoProps {
  name: string;
  logoUrl: string | null;
  className?: string;
}

export const CompanyLogo = ({ name, logoUrl, className }: CompanyLogoProps) => {
  const shape = cn(
    "border-border bg-elevated size-12 shrink-0 rounded-md border",
    className,
  );

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt=""
        loading="lazy"
        className={cn(shape, "object-cover")}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        shape,
        "text-muted-foreground flex items-center justify-center font-mono text-lg",
      )}
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
};
