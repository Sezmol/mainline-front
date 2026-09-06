import {
  departmentsControllerListOptions,
  departmentsControllerListQueryKey,
  departmentsControllerMembersOptions,
  departmentsControllerMembersQueryKey,
} from "@shared/api";

export const departmentKeys = {
  list: (companyId: string) =>
    departmentsControllerListQueryKey({ path: { companyId } }),
  lists: () => [{ _id: "departmentsControllerList" }] as const,
  members: (companyId: string, departmentId: string) =>
    departmentsControllerMembersQueryKey({ path: { companyId, departmentId } }),
};

export const departmentQueries = {
  list: (companyId: string) =>
    departmentsControllerListOptions({ path: { companyId } }),

  members: (companyId: string, departmentId: string) =>
    departmentsControllerMembersOptions({ path: { companyId, departmentId } }),
};
