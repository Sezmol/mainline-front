import { Link } from "@tanstack/react-router";

import { Button } from "@shared/ui/button";

export const CompanyNotFound = () => (
  <div className="border-border flex flex-col items-start gap-3 rounded-lg border border-dashed p-10">
    <h1 className="text-base font-semibold">No such company</h1>
    <p className="text-muted-foreground text-sm">
      The address may have changed, or the company was never here.
    </p>
    <Button
      variant="outline"
      size="sm"
      nativeButton={false}
      render={<Link to="/companies" />}
    >
      Browse companies
    </Button>
  </div>
);
