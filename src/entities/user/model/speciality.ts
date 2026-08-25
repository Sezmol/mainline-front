export const SPECIALITIES = [
  'frontend',
  'backend',
  'qa',
  'design',
  'manager',
  'hr',
] as const;

export type Speciality = (typeof SPECIALITIES)[number];

export const SPECIALITY_LABELS: Record<Speciality, string> = {
  frontend: 'Frontend Developer',
  backend: 'Backend Developer',
  qa: 'QA Engineer',
  design: 'Designer',
  manager: 'Manager',
  hr: 'HR',
};
