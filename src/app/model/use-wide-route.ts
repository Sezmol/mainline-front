import { useMatches } from "@tanstack/react-router";

export const useWideRoute = () =>
  useMatches({
    select: (matches) => matches.some((match) => match.staticData.wide),
  });
