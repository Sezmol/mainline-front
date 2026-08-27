import type { ReactNode } from "react";

import { cn } from "@shared/lib/cn";

import { Label } from "./label";

interface FormFieldProps {
  id: string;
  label: string;
  error?: string | undefined;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const FormField = ({
  id,
  label,
  error,
  hint,
  children,
  className,
}: FormFieldProps) => (
  <div className={cn("flex flex-col gap-2", className)}>
    <Label htmlFor={id}>{label}</Label>
    {children}
    {error ? (
      <p id={`${id}-error`} role="alert" className="text-destructive text-xs">
        {error}
      </p>
    ) : hint ? (
      <p id={`${id}-hint`} className="text-muted-foreground text-xs">
        {hint}
      </p>
    ) : null}
  </div>
);
