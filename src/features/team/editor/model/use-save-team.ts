import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { chatKeys } from "@entities/chat";
import { companyKeys } from "@entities/company";
import { teamKeys } from "@entities/team";

import {
  teamsControllerCreate,
  teamsControllerRemove,
  teamsControllerUpdate,
} from "@shared/api";

export interface TeamValues {
  name: string;
  description: string;
}

const toBody = ({ name, description }: TeamValues) => ({
  name,
  ...(description ? { description } : {}),
});

const useRefresh = () => {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    void queryClient.invalidateQueries({ queryKey: companyKeys.pages() });
    void queryClient.invalidateQueries({ queryKey: chatKeys.all() });
  };
};

export const useCreateTeam = (companyId?: string) => {
  const refresh = useRefresh();

  return useMutation({
    mutationFn: async (values: TeamValues) => {
      const { data } = await teamsControllerCreate({
        body: { ...toBody(values), ...(companyId ? { companyId } : {}) },
        throwOnError: true,
      });
      return data;
    },
    onSuccess: refresh,
  });
};

export const useUpdateTeam = (teamId: string) => {
  const queryClient = useQueryClient();
  const refresh = useRefresh();

  return useMutation({
    mutationFn: async (values: TeamValues) => {
      const { data } = await teamsControllerUpdate({
        path: { teamId },
        body: toBody(values),
        throwOnError: true,
      });
      return data;
    },
    onSuccess: (team) => {
      queryClient.setQueryData(teamKeys.byId(teamId), team);
      refresh();
    },
  });
};

export const useDisbandTeam = () => {
  const navigate = useNavigate();
  const refresh = useRefresh();

  return useMutation({
    mutationFn: async (teamId: string) => {
      await teamsControllerRemove({ path: { teamId }, throwOnError: true });
    },
    onSuccess: () => {
      refresh();
      void navigate({ to: "/feed" });
      toast.success("Team disbanded");
    },
    onError: () => {
      toast.error("The team could not be disbanded");
    },
  });
};
