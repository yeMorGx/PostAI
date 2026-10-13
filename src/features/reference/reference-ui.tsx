"use client";

import { Button, Card, Chip, Table } from "@heroui/react";
import type { ReactNode } from "react";

export function ReferenceCard({ children, className = "", title, description }: { children: ReactNode; className?: string; title?: string; description?: string }) {
  return <Card className={`reference-card ${className}`}>
    {title && <Card.Header><h2>{title}</h2>{description && <p className="muted text-sm">{description}</p>}</Card.Header>}
    <Card.Content>{children}</Card.Content>
  </Card>;
}

export function ReferenceBadge({ children, tone = "p-cinza" }: { children: ReactNode; tone?: string }) {
  return <Chip size="sm" className={`reference-pill ${tone}`}>{children}</Chip>;
}

export function ReferenceHeader({ title, description, company = true, children }: { title: string; description: string; company?: boolean; children?: ReactNode }) {
  return <header className="reference-header"><div>
    {company && <p className="reference-company"><span/>Piersec</p>}
    <h1>{title}</h1><p className="muted mt-2">{description}</p>
  </div>{children}</header>;
}

export function ReferenceTable({ label, columns, rows }: { label: string; columns: string[]; rows: ReactNode[][] }) {
  return <Table className="reference-table"><Table.ScrollContainer><Table.Content aria-label={label}>
    <Table.Header>{columns.map((column, index) => <Table.Column key={column} isRowHeader={index === 0}>{column}</Table.Column>)}</Table.Header>
    <Table.Body>{rows.map((row, index) => <Table.Row key={index} id={String(index)}>{row.map((cell, column) => <Table.Cell key={column}>{cell}</Table.Cell>)}</Table.Row>)}</Table.Body>
  </Table.Content></Table.ScrollContainer></Table>;
}

export function FilterButtons({ label, options, value, onChange }: { label: string; options: { id: string; name: string }[]; value: string; onChange: (value: string) => void }) {
  return <div role="group" aria-label={label} className="reference-filters">{options.map((option) => <Button key={option.id} variant="secondary" className={`reference-filter ${value === option.id ? "is-selected" : ""}`} aria-pressed={value === option.id} onPress={() => onChange(option.id)}>{option.name}</Button>)}</div>;
}

export function ReferenceNotice() {
  return <p className="reference-demo-note">Demonstração do HTML de referência. Dados de exemplo; nenhuma publicação ou integração real é executada nesta prévia.</p>;
}
