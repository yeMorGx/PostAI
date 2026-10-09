import type { Metadata } from "next";
import localFont from "next/font/local";
import { Providers } from "@/components/providers";
import "./globals.css";

const bodyFont = localFont({ src: "../../public/fonts/source-sans-3.woff2", variable: "--font-body", display: "swap", weight: "200 900" });
const headingFont = localFont({ src: "../../public/fonts/bricolage-grotesque.woff2", variable: "--font-heading", display: "swap", weight: "200 800" });

export const metadata: Metadata = { title: { default: "PostAI | Piersec", template: "%s | PostAI" }, description: "Planejamento de conteúdo da equipe Piersec.", robots: { index: false, follow: false } };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="pt-BR"><body className={`${bodyFont.variable} ${headingFont.variable}`}><Providers>{children}</Providers></body></html>;
}
