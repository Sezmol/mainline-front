import type { CompanyRole } from "@entities/company";

import {
  ASSIGNABLE_ROLES,
  type AssignableRole,
  COMPANY_ROLE_LABELS,
} from "@shared/config";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/select";

import { useSetRole } from "../model/use-set-role";

interface RoleSelectProps {
  companyId: string;
  userId: string;
  role: CompanyRole;
}

export const RoleSelect = ({ companyId, userId, role }: RoleSelectProps) => {
  const setRole = useSetRole(companyId);

  if (role === "owner") return null;

  return (
    <Select
      items={COMPANY_ROLE_LABELS}
      value={role}
      onValueChange={(value) =>
        setRole.mutate({ userId, role: value as AssignableRole })
      }
    >
      <SelectTrigger size="sm" className="w-32" aria-label="Role">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ASSIGNABLE_ROLES.map((option) => (
          <SelectItem key={option} value={option}>
            {COMPANY_ROLE_LABELS[option]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
