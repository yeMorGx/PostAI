import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  const failure = () => NextResponse.redirect(new URL("/login?reason=expired", request.url));
  if (!tokenHash || (type !== "invite" && type !== "email")) return failure();
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (error) return failure();
    const { error: acceptanceError } = await supabase.rpc("accept_piersec_invitation", {});
    if (acceptanceError) return NextResponse.redirect(new URL("/login?reason=access", request.url));
    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch { return failure(); }
}
