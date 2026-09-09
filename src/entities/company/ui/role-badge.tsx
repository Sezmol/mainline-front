import { COMPANY_ROLE_LABELS } from "@shared/config";
import { Badge } from "@shared/ui/badge";

import type { CompanyRole } from "../company.types";

export const RoleBadge = ({ role }: { role: CompanyRole }) => (
  <Badge variant={role === "owner" ? "default" : "outline"}>
    {COMPANY_ROLE_LABELS[role]}
  </Badge>
);
