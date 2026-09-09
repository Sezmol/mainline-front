import { UserMinusIcon } from "@phosphor-icons/react";

import { Button } from "@shared/ui/button";

import { useRemoveFromDepartment } from "../model/use-remove-from-department";

interface RemoveFromDepartmentButtonProps {
  companyId: string;
  departmentId: string;
  userId: string;
  leaving?: boolean;
}

export const RemoveFromDepartmentButton = ({
  companyId,
  departmentId,
  userId,
  leaving,
}: RemoveFromDepartmentButtonProps) => {
  const remove = useRemoveFromDepartment(companyId, departmentId);

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-muted-foreground hover:text-destructive font-mono text-xs"
      disabled={remove.isPending}
      onClick={() => remove.mutate(userId)}
    >
      <UserMinusIcon className="size-3.5" />
      {leaving ? "Leave" : "Remove"}
    </Button>
  );
};
