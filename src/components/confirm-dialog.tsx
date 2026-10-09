"use client";

import { Button, Modal } from "@heroui/react";

export function ConfirmDialog({ title, description, pending, onConfirm, onClose }: { title: string; description: string; pending: boolean; onConfirm: () => void; onClose: () => void }) {
  return <Modal.Backdrop isOpen onOpenChange={(open) => { if (!open && !pending) onClose(); }} isDismissable={!pending} isKeyboardDismissDisabled={pending}><Modal.Container size="sm"><Modal.Dialog><Modal.Header><Modal.Heading>{title}</Modal.Heading></Modal.Header><Modal.Body><p>{description}</p></Modal.Body><Modal.Footer><Button variant="secondary" autoFocus isDisabled={pending} onPress={onClose}>Cancelar</Button><Button variant="danger" isPending={pending} onPress={onConfirm}>{pending ? "Removendo…" : "Confirmar remoção"}</Button></Modal.Footer></Modal.Dialog></Modal.Container></Modal.Backdrop>;
}
