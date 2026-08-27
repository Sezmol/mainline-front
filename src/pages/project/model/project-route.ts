import { getRouteApi } from "@tanstack/react-router";

export const projectRoute = getRouteApi(
  "/_app/u/$nickname_/projects/$projectId",
);
