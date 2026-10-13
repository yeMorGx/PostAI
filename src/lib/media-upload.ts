import "server-only";
import type { NextRequest } from "next/server";
import { HttpError } from "./http";

export async function readMediaForm(request: NextRequest) {
  const maximum = 6 * 1024 * 1024;
  if (Number(request.headers.get("content-length") ?? 0) > maximum) throw new HttpError(413, "Envie uma imagem de até 5 MB por vez.");
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "Envie o arquivo.");
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maximum) { await reader.cancel(); throw new HttpError(413, "Envie uma imagem de até 5 MB por vez."); }
    chunks.push(value);
  }
  try { return await new Response(new Uint8Array(Buffer.concat(chunks)), { headers: { "content-type": request.headers.get("content-type") ?? "" } }).formData(); }
  catch { throw new HttpError(400, "Formulário de arquivo inválido."); }
}

export function imageType(bytes: Uint8Array) {
  if ([137,80,78,71,13,10,26,10].every((value,index) => bytes[index] === value)) return { mime: "image/png", extension: "png" };
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return { mime: "image/jpeg", extension: "jpg" };
  if (Buffer.from(bytes.subarray(0,4)).toString() === "RIFF" && Buffer.from(bytes.subarray(8,12)).toString() === "WEBP") return { mime: "image/webp", extension: "webp" };
  throw new HttpError(400, "Use uma imagem PNG, JPEG ou WebP válida.");
}
