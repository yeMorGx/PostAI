import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { loginSchema } from "@/lib/schemas";
import { apiError, assertSameOrigin, HttpError, readJson } from "@/lib/http";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    if (!isSupabaseConfigured()) throw new HttpError(503, "A conexão com o banco ainda não foi configurada.");
    const { email } = loginSchema.parse(await readJson(request));
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: `${process.env.APP_URL ?? new URL(request.url).origin}/auth/callback` },
    });
    if (error?.status === 429) throw new HttpError(429, "Aguarde alguns minutos antes de pedir outro link.");
    if (error && (error.status === undefined || error.status >= 500)) throw new HttpError(503, "O serviço de entrada está indisponível. Tente novamente mais tarde.");
    return NextResponse.json({ message: "Se este e-mail tiver acesso, você receberá um link para entrar." });
  } catch (error) { return apiError(error); }
}
