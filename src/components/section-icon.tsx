type SectionIconName = "overview" | "cycle" | "delivery" | "identity" | "results" | "calendar";

export function SectionIcon({ name }: { name: SectionIconName }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {name === "overview" && <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>}
    {name === "cycle" && <path d="M4 12h4l2-6 4 12 2-6h4"/>}
    {name === "delivery" && <><path d="m21 8-9-5-9 5 9 5 9-5Z"/><path d="M3 8v8l9 5 9-5V8M12 13v8"/></>}
    {name === "identity" && <><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M14 10h4M14 14h4M6 16c.6-1.4 1.8-2 3-2s2.4.6 3 2"/></>}
    {name === "results" && <path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>}
    {name === "calendar" && <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01"/></>}
  </svg>;
}
