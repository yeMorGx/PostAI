"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Content } from "@/lib/database.types";
import type { ContentInput } from "@/lib/schemas";
import { fetchJson } from "@/lib/api-client";

export function useContent(workspaceId: string, initialData: Content[]) {
  const client = useQueryClient(); const key = ["content", workspaceId];
  const query = useQuery({ queryKey: key, queryFn: () => fetchJson<Content[]>("/api/content"), initialData });
  const save = useMutation({
    mutationFn: ({ id, input }: { id?: string; input: ContentInput }) => fetchJson<Content>(id ? `/api/content/${id}` : "/api/content", { method: id ? "PATCH" : "POST", body: JSON.stringify(input) }),
    onSuccess: (content) => client.setQueryData<Content[]>(key, (current) => [content, ...(current ?? []).filter((c) => c.id !== content.id)]),
    onSettled: () => client.invalidateQueries({ queryKey: key }),
  });
  const remove = useMutation({ mutationFn: (id: string) => fetchJson(`/api/content/${id}`, { method: "DELETE" }), onSuccess: () => client.invalidateQueries({ queryKey: key }) });
  return { query, save, remove };
}
