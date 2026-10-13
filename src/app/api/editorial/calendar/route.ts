import { NextResponse } from "next/server";
import { requireApiContext } from "@/lib/auth";
import { apiError } from "@/lib/http";
import { editorialError } from "@/lib/editorial-server";
import { buildCalendar } from "@/lib/ical";
import type { EditorialPost } from "@/lib/editorial";

export async function GET() {
  try {
    const { supabase,workspace } = await requireApiContext();
    const { data,error } = await supabase.from("editorial_posts").select("*").eq("workspace_id",workspace.id).in("status",["scheduled","published","cancelled"]).not("planned_for","is",null).order("planned_for",{ascending:true}).limit(1000);
    if (error) editorialError(error);
    return new NextResponse(buildCalendar((data ?? []) as EditorialPost[]), { headers: { "Content-Type":"text/calendar; charset=utf-8","Content-Disposition":"attachment; filename=piersec-publicacoes.ics","Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff" } });
  } catch (error) { return apiError(error); }
}
