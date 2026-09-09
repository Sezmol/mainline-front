import { useState } from "react";

import { PencilIcon } from "@phosphor-icons/react";

import type { Project } from "@entities/project";

import { Button } from "@shared/ui/button";

import { ProjectFormDialog } from "./project-form-dialog";

export const EditProjectButton = ({ project }: { project: Project }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="font-mono text-xs"
        onClick={() => setOpen(true)}
      >
        <PencilIcon className="size-3.5" />
        Edit
      </Button>

      <ProjectFormDialog open={open} onOpenChange={setOpen} project={project} />
    </>
  );
};
