export const SPECIALITIES = [
  "frontend",
  "backend",
  "qa",
  "design",
  "manager",
  "hr",
] as const;

export type Speciality = (typeof SPECIALITIES)[number];

export const SPECIALITY_LABELS: Record<Speciality, string> = {
  frontend: "Frontend Developer",
  backend: "Backend Developer",
  qa: "QA Engineer",
  design: "Designer",
  manager: "Manager",
  hr: "HR",
};

export const COMPANY_ROLES = ["owner", "hr", "manager", "employee"] as const;

export type CompanyRole = (typeof COMPANY_ROLES)[number];

export const COMPANY_ROLE_LABELS: Record<CompanyRole, string> = {
  owner: "Owner",
  hr: "HR",
  manager: "Manager",
  employee: "Employee",
};

export const ASSIGNABLE_ROLES = ["hr", "manager", "employee"] as const;

export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

export const POST_TYPES = ["content", "vacancy", "event", "task"] as const;

export type PostType = (typeof POST_TYPES)[number];

export const POST_TYPE_LABELS: Record<PostType, string> = {
  content: "Content",
  vacancy: "Vacancy",
  event: "Event",
  task: "Task",
};

export const WORK_FORMATS = ["onsite", "remote", "hybrid"] as const;

export type WorkFormat = (typeof WORK_FORMATS)[number];

export const WORK_FORMAT_LABELS: Record<WorkFormat, string> = {
  onsite: "On-site",
  remote: "Remote",
  hybrid: "Hybrid",
};

export const COLUMN_KINDS = ["todo", "doing", "done"] as const;

export type ColumnKind = (typeof COLUMN_KINDS)[number];

export const COLUMN_KIND_LABELS: Record<ColumnKind, string> = {
  todo: "To do",
  doing: "In progress",
  done: "Done",
};

export const DEFAULT_COLUMNS = [
  { name: "To Do", kind: "todo" },
  { name: "In Progress", kind: "doing" },
  { name: "Done", kind: "done" },
] as const satisfies readonly { name: string; kind: ColumnKind }[];

export const DEFAULT_STATUS = DEFAULT_COLUMNS[0].name;
