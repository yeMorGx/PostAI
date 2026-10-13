"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api-client";
import type { EditorialData } from "@/lib/editorial";

export const editorialKey = ["editorial"] as const;

export function useEditorial(initialData: EditorialData) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: editorialKey,
    queryFn: () => fetchJson<EditorialData>("/api/editorial"),
    initialData,
    staleTime: 10_000,
    refetchInterval: 30_000,
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey: editorialKey });
  const mutate = useMutation({
    mutationFn: async ({ url, method, body }: { url: string; method: "POST" | "PATCH"; body?: unknown }) => fetchJson<unknown>(url, { method, body: body === undefined ? undefined : JSON.stringify(body) }),
    onMutate: async (variables) => {
      const match = variables.method === "PATCH" ? variables.url.match(/^\/api\/editorial\/posts\/([0-9a-f-]+)$/i) : null;
      if (!match || !variables.body || typeof variables.body !== "object") return null;
      await queryClient.cancelQueries({ queryKey: editorialKey });
      const previous = queryClient.getQueryData<EditorialData>(editorialKey);
      const input = variables.body as { title: string; body: string; hashtags: string; slides: EditorialData["posts"][number]["slides"]; planned_for: string | null };
      if (previous) queryClient.setQueryData<EditorialData>(editorialKey, {
        ...previous,
        posts: previous.posts.map((post) => post.id !== match[1] ? post : {
          ...post, ...input, status: post.status === "scheduled" ? "cancelled" : "draft", revision: post.revision + 1,
          calendar_sequence: post.calendar_sequence + 1, approved_revision: null, approved_by: null, approved_at: null,
        }),
      });
      return previous ? { previous } : null;
    },
    onError: (_error, _variables, context) => { if (context?.previous) queryClient.setQueryData(editorialKey, context.previous); },
    onSuccess: refresh,
  });
  return { ...query, mutate, refresh };
}
