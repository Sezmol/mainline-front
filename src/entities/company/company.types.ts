import type {
  CompanyCardDtoOutput,
  CompanyDtoOutput,
  CompanyPageDtoOutput,
  MemberDtoOutput,
} from "@shared/api";

export type Company = CompanyDtoOutput;
export type CompanyCard = CompanyCardDtoOutput;
export type CompanyPage = CompanyPageDtoOutput;
export type Member = MemberDtoOutput;

export type CompanyViewer = NonNullable<CompanyPage["viewer"]>;
export type CompanyRole = CompanyViewer["role"];
export type ContainerRef = CompanyViewer["departments"][number];
