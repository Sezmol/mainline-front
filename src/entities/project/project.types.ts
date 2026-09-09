import type { BoardColumnDtoOutput, ProjectDtoOutput } from "@shared/api";

export type Project = ProjectDtoOutput;

export type BoardColumn = BoardColumnDtoOutput;

export type TaskCounts = Project["counts"];
