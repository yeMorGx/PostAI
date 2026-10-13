import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireApiContext } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { apiError, assertSameOrigin, HttpError } from "@/lib/http";
import { uuidSchema } from "@/lib/schemas";
import { editorialError } from "@/lib/editorial-server";
import { imageType, readMediaForm } from "@/lib/media-upload";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const { supabase, workspace } = await requireApiContext("edit");
    const id = uuidSchema.parse((await params).id);
    const form = await readMediaForm(request);
    const revision = z.coerce.number().int().positive().parse(form.get("revision"));
    const file = form.get("file");
    if (!(file instanceof File) || file.size < 1 || file.size > 5 * 1024 * 1024) throw new HttpError(400, "Escolha uma imagem de até 5 MB.");
    const { data: post, error: postError } = await supabase.from("editorial_posts").select("id,status,revision").eq("id",id).eq("workspace_id",workspace.id).single();
    if (postError || !post) throw new HttpError(404, "Peça não encontrada.");
    if (post.status === "published" || post.revision !== revision) throw new HttpError(409, "A peça foi alterada ou publicada. Atualize antes de enviar o arquivo.");
    const bytes = new Uint8Array(await file.arrayBuffer());
    const type = imageType(bytes);
    const path = `${workspace.id}/${id}/${randomUUID()}.${type.extension}`;
    const admin = createAdminClient();
    const { error: uploadError } = await admin.storage.from("editorial-media").upload(path, bytes, { contentType: type.mime, upsert: false });
    if (uploadError) throw new HttpError(503, "Não foi possível enviar a imagem. Confira o bucket de mídia.");
    const { data: assetId, error } = await supabase.rpc("editorial_attach_asset", { p_post:id,p_revision:revision,p_path:path,p_name:file.name.slice(0,180),p_mime:type.mime,p_size:file.size });
    if (error) {
      await admin.storage.from("editorial-media").remove([path]);
      editorialError(error);
    }
    return NextResponse.json({ id:assetId, revision:revision+1 }, { status:201 });
  } catch (error) { return apiError(error); }
}
