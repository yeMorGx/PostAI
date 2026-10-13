import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import type { EditorialData } from "./editorial";
import { HttpError } from "./http";

export function editorialError(error: { code?: string; message: string }) {
  if (["PGRST205", "PGRST202", "42P01", "42883"].includes(error.code ?? "")) throw new HttpError(503, "A migração do fluxo editorial ainda precisa ser aplicada ao Supabase.");
  if (error.code === "42501") throw new HttpError(403, "Seu perfil não permite esta ação.");
  if (error.code === "40001") throw new HttpError(409, error.message);
  if (error.code === "23505") throw new HttpError(409, "Já existe uma semana com esta data ou o arquivo já foi adicionado.");
  if (["22023", "23514", "23502"].includes(error.code ?? "")) throw new HttpError(400, error.code === "22023" ? error.message : "Confira o conteúdo, as datas e os arquivos informados.");
  throw error;
}

export async function loadEditorial(supabase: SupabaseClient<Database>, workspaceId: string): Promise<EditorialData> {
  const result = await supabase.from("editorial_cycles").select("*").eq("workspace_id", workspaceId).order("week_start", { ascending: false }).limit(104);
  if (result.error) {
    if (["PGRST205", "42P01"].includes(result.error.code)) return { ready: false, cycles: [], posts: [], assets: [], brand: null };
    editorialError(result.error);
  }
  const cycles = result.data ?? [];
  const ids = cycles.map((cycle) => cycle.id);
  const [postsResult, brandResult] = await Promise.all([
    ids.length ? supabase.from("editorial_posts").select("*").eq("workspace_id", workspaceId).in("cycle_id", ids).order("planned_for", { ascending: true }).limit(1000) : Promise.resolve({ data: [], error: null }),
    supabase.from("brand_profiles").select("*").eq("workspace_id", workspaceId).single(),
  ]);
  for (const query of [postsResult, brandResult]) if (query.error) editorialError(query.error);
  const posts = postsResult.data ?? [];
  const postIds = posts.map((post) => post.id);
  const storedAssets = (await Promise.all(Array.from({ length: Math.ceil(postIds.length / 100) }, async (_, index) => {
    const batch = postIds.slice(index * 100, (index + 1) * 100);
    const query = await supabase.from("editorial_assets").select("*").eq("workspace_id", workspaceId).in("post_id", batch).order("position", { ascending: true }).limit(1000);
    if (query.error) editorialError(query.error);
    return query.data ?? [];
  }))).flat();
  const signedBatches = await Promise.all(Array.from({ length: Math.ceil(storedAssets.length / 100) }, async (_, index) => {
    const batch = storedAssets.slice(index * 100, (index + 1) * 100);
    const signed = await supabase.storage.from("editorial-media").createSignedUrls(batch.map((asset) => asset.storage_path), 600);
    return signed.data ?? [];
  }));
  const signedByPath = new Map(signedBatches.flat().map((item) => [item.path, item.signedUrl]));
  const assets = storedAssets.map((asset) => ({ ...asset, url: signedByPath.get(asset.storage_path) ?? undefined }));
  return { ready: true, cycles, posts, assets, brand: brandResult.data };
}
