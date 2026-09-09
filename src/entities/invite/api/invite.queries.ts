import {
  invitesControllerMineOptions,
  invitesControllerMineQueryKey,
  invitesControllerSentOptions,
  invitesControllerSentQueryKey,
} from "@shared/api";

export const inviteKeys = {
  mine: () => invitesControllerMineQueryKey({ query: { status: "pending" } }),
  mineAll: () => [{ _id: "invitesControllerMine" }] as const,
  sent: () => invitesControllerSentQueryKey({ query: { status: "pending" } }),
  sentAll: () => [{ _id: "invitesControllerSent" }] as const,
};

export const inviteQueries = {
  mine: () => invitesControllerMineOptions({ query: { status: "pending" } }),
  sent: () => invitesControllerSentOptions({ query: { status: "pending" } }),
};
