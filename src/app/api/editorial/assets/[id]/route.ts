import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireApiContext } from "@/lib/auth";
import { apiError, assertSameOrigin, HttpError, readJson } from "@/lib/http";
import { uuidSchema } from "@/lib/schemas";
import { editorialError } from "@/lib/editorial-server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { supabase,workspace } = await requireApiContext();
    const id = uuidSchema.parse((await params).id);
    const { data:asset,error } = await supabase.from("editorial_assets").select("*").eq("id",id).eq("workspace_id",workspace.id).single();
    if (error || !asset) throw new HttpError(404,"Arquivo não encontrado.");
    const { data:file,error:downloadError } = await supabase.storage.from("editorial-media").download(asset.storage_path);
    if (downloadError || !file) throw new HttpError(503,"Não foi possível baixar o arquivo.");
    return new NextResponse(await file.arrayBuffer(), { headers: { "Content-Type":asset.mime_type,"Content-Disposition":`attachment; filename="imagem-${id}"; filename*=UTF-8''${encodeURIComponent(asset.file_name)}`,"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff" } });
  } catch (error) { return apiError(error); }
}
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const { supabase } = await requireApiContext("edit");
    const id = uuidSchema.parse((await params).id);
    const input = z.object({ revision:z.number().int().positive() }).strict().parse(await readJson(request));
    const { data:path,error } = await supabase.rpc("editorial_remove_asset", { p_asset:id,p_revision:input.revision });
    if (error) editorialError(error);
    const cleanup = path ? await createAdminClient().storage.from("editorial-media").remove([path]) : null;
    return NextResponse.json({ removed:true, warning:cleanup?.error ? "Anexo removido da peça. A exclusão do arquivo no armazenamento ainda está pendente." : undefined });
  } catch (error) { return apiError(error); }
}
