import { getRouteApi } from "@tanstack/react-router";

export const portfolioItemRoute = getRouteApi(
  "/_app/u/$nickname_/portfolio/$itemId",
);
