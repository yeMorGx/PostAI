"use client";
import { Button } from "@heroui/react";
import { Panel } from "@/components/ui";

export default function WorkspaceError({ reset }: { reset: () => void }) {
  return <Panel className="p-8"><h1>Não foi possível carregar esta página</h1><p className="muted mt-4">Confira a conexão com o banco e as migrações do projeto.</p><Button variant="secondary" className="mt-6" onPress={reset}>Tentar novamente</Button></Panel>;
}
