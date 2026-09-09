import type { CompanyRole } from "../company.types";

export const ROLE_ORDER: Record<CompanyRole, number> = {
  owner: 0,
  hr: 1,
  manager: 2,
  employee: 3,
};

export const byRole = <T extends { role: CompanyRole }>(a: T, b: T) =>
  ROLE_ORDER[a.role] - ROLE_ORDER[b.role];
