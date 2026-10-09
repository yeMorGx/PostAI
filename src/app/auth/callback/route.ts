import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        const { error: invitationError } = await supabase.rpc("accept_piersec_invitation", {});
        return NextResponse.redirect(new URL(invitationError ? "/login?reason=access" : "/dashboard", request.url));
      }
    } catch { /* Expired codes return to the login form without revealing tokens. */ }
  }
  return NextResponse.redirect(new URL("/login?reason=expired", request.url));
}
