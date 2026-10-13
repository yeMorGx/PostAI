"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type ReferenceState = {
  published: Record<string, boolean>;
  setPublished: (channel: string, value: boolean) => void;
  clientPreview: boolean;
  setClientPreview: (value: boolean) => void;
};
const Context = createContext<ReferenceState | null>(null);

export function ReferenceStateProvider({ children }: { children: ReactNode }) {
  const [published, updatePublished] = useState<Record<string, boolean>>({});
  const [clientPreview, setClientPreview] = useState(false);
  return <Context.Provider value={{ published, setPublished: (channel, value) => updatePublished((previous) => ({ ...previous, [channel]: value })), clientPreview, setClientPreview }}>{children}</Context.Provider>;
}

export function useReferenceState() {
  const state = useContext(Context);
  if (!state) throw new Error("ReferenceStateProvider necessário.");
  return state;
}
