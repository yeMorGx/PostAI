import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) throw new Error("O envio de convites ainda não foi configurado.");
  return createClient<Database>(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
}
