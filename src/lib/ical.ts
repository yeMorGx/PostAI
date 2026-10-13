import { channelLabels, type EditorialPost } from "./editorial";

function escape(value: string) { return value.replace(/\\/g,"\\\\").replace(/\r?\n/g,"\\n").replace(/;/g,"\\;").replace(/,/g,"\\,"); }
function stamp(value: string) { return new Date(value).toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z$/,"Z"); }
function fold(line: string) {
  let result = "", width = 0;
  for (const character of line) {
    const bytes = new TextEncoder().encode(character).length;
    if (width + bytes > 73) { result += "\r\n "; width = 1; }
    result += character; width += bytes;
  }
  return result;
}
export function buildCalendar(posts: EditorialPost[]) {
  const lines = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Piersec//Calendario editorial//PT-BR","CALSCALE:GREGORIAN","METHOD:PUBLISH","X-WR-CALNAME:Piersec - Publicações","X-WR-TIMEZONE:America/Sao_Paulo"];
  for (const post of posts) {
    if (!post.planned_for || !["scheduled","published","cancelled"].includes(post.status)) continue;
    const end = new Date(Date.parse(post.planned_for)+30*60*1000).toISOString();
    lines.push("BEGIN:VEVENT",`UID:${post.id}@postai.piersec`, `DTSTAMP:${stamp(post.updated_at)}`, `LAST-MODIFIED:${stamp(post.updated_at)}`, `SEQUENCE:${post.calendar_sequence}`, `DTSTART:${stamp(post.planned_for)}`, `DTEND:${stamp(end)}`, `SUMMARY:${escape(`${channelLabels[post.channel]}: ${post.title}`)}`, `DESCRIPTION:${escape(`${post.body}\n\n${post.hashtags}\n\nPublicação manual pela equipe. Horário de São Paulo.`)}`,post.status === "cancelled" ? "STATUS:CANCELLED" : "STATUS:CONFIRMED", "END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n")+"\r\n";
}
