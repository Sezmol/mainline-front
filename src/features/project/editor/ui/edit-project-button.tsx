import { useState } from "react";

import { PencilIcon } from "lucide-react";

import type { Project } from "@entities/project";

import { Button } from "@shared/ui/button";

import { ProjectFormDialog } from "./project-form-dialog";

export const EditProjectButton = ({ project }: { project: Project }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        aria-label="Edit project"
        className="text-muted-foreground font-mono text-xs"
        onClick={() => setOpen(true)}
      >
        <PencilIcon className="size-3.5" />
        Edit
      </Button>

      {open ? (
        <ProjectFormDialog
          open={open}
          onOpenChange={setOpen}
          userId={project.author.id}
          project={project}
        />
      ) : null}
    </>
  );
};
