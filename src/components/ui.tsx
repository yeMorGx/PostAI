"use client";
import NextLink from "next/link";
import { Alert, Card, Chip, Link, ListBox, Select, Spinner, buttonVariants } from "@heroui/react";
import type { ReactNode } from "react";
export function Panel({ children, className = "", title }: { children: ReactNode; className?: string; title?: string }) {
  return <Card className={className}>{title && <Card.Header><Card.Title>{title}</Card.Title></Card.Header>}<Card.Content>{children}</Card.Content></Card>;
}
export function Notice({ children, className = "", status = "accent" }: { children: ReactNode; className?: string; status?: "accent" | "danger" | "success" }) {
  return <Alert status={status} className={className}><Alert.Indicator/><Alert.Content><Alert.Description>{children}</Alert.Description></Alert.Content></Alert>;
}
export function AppLink({ href, children, className = "", variant, current }: { href: string; children: ReactNode; className?: string; variant?: "primary" | "secondary"; current?: boolean }) {
  return <Link href={href} aria-current={current ? "page" : undefined} className={variant ? `${buttonVariants({ variant })} ${className}` : className} render={(props) => "href" in props ? <NextLink {...props} href={href}/> : <span {...props}/>}>{children}</Link>;
}
export function Choice({ value, onChange, options, label, disabled = false, className = "" }: { value: string; onChange: (value: string) => void; options: { id: string; label: string }[]; label: string; disabled?: boolean; className?: string }) {
  return <Select value={value} onChange={(key) => { if (typeof key === "string") onChange(key); }} isDisabled={disabled} aria-label={label} className={className}><Select.Trigger><Select.Value/><Select.Indicator/></Select.Trigger><Select.Popover><ListBox>{options.map((option) => <ListBox.Item key={option.id} id={option.id} textValue={option.label}>{option.label}<ListBox.ItemIndicator/></ListBox.Item>)}</ListBox></Select.Popover></Select>;
}
export function LoadingNotice() { return <div className="flex items-center gap-3" role="status"><Spinner size="sm"/>Carregando o espaço Piersec…</div>; }
export function Badge({ children }: { children: ReactNode }) { return <Chip>{children}</Chip>; }
