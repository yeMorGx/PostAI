"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Member, Invitation } from "@/lib/database.types";
import type { Role } from "@/lib/permissions";
import { fetchJson } from "@/lib/api-client";

export type TeamData = { members: Member[]; invitations: Invitation[] };

export function useTeam(workspaceId: string, initialData: TeamData) {
  const client = useQueryClient(); const key = ["team", workspaceId];
  const query = useQuery({ queryKey: key, queryFn: () => fetchJson<TeamData>("/api/team"), initialData });
  const changeRole = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: Role }) => fetchJson(`/api/team/${userId}`, { method: "PATCH", body: JSON.stringify({ role }) }),
    onMutate: async ({ userId, role }) => {
      await client.cancelQueries({ queryKey: key }); const previous = client.getQueryData<TeamData>(key);
      client.setQueryData<TeamData>(key, (current) => current && ({ ...current, members: current.members.map((m) => m.user_id === userId ? { ...m, role } : m) }));
      return { previous };
    },
    onError: (_error, _variables, context) => { if (context?.previous) client.setQueryData(key, context.previous); },
    onSettled: () => client.invalidateQueries({ queryKey: key }),
  });
  const removeMember = useMutation({ mutationFn: (userId: string) => fetchJson(`/api/team/${userId}`, { method: "DELETE" }), onSuccess: () => client.invalidateQueries({ queryKey: key }) });
  const invite = useMutation({ mutationFn: (input: { email: string; role: Role }) => fetchJson<{ invitation: Invitation; warning: string | null }>("/api/team/invitations", { method: "POST", body: JSON.stringify(input) }), onSuccess: () => client.invalidateQueries({ queryKey: key }) });
  const revoke = useMutation({ mutationFn: (id: string) => fetchJson(`/api/team/invitations?id=${id}`, { method: "DELETE" }), onSuccess: () => client.invalidateQueries({ queryKey: key }) });
  return { query, changeRole, removeMember, invite, revoke };
}
