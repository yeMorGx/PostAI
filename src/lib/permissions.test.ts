import { describe, expect, it } from "vitest";
import { can } from "./permissions";
import { contentSchema, invitationSchema } from "./schemas";

describe("authorization boundaries", () => {
  it("keeps approvals separate from editing and team management", () => {
    expect(can("approver", "approve")).toBe(true);
    expect(can("approver", "edit")).toBe(false);
    expect(can("editor", "approve")).toBe(false);
    expect(can("viewer", "edit")).toBe(false);
    expect(can("editor", "manage_team")).toBe(false);
    expect(can("admin", "manage_team")).toBe(true);
  });
  it("rejects client-provided workspace IDs and audit fields", () => {
    const valid = { title: "Uma pauta", platform: "linkedin", body: "", planned_for: null };
    expect(contentSchema.safeParse(valid).success).toBe(true);
    expect(contentSchema.safeParse({ ...valid, workspace_id: crypto.randomUUID() }).success).toBe(false);
    expect(contentSchema.safeParse({ ...valid, created_by: crypto.randomUUID() }).success).toBe(false);
  });
  it("bounds inputs and prevents arbitrary roles", () => {
    expect(invitationSchema.safeParse({ email: "pessoa@piersec.test", role: "owner" }).success).toBe(false);
    expect(contentSchema.safeParse({ title: "ab", platform: "instagram", body: "", planned_for: null }).success).toBe(false);
    expect(contentSchema.safeParse({ title: "Pauta", platform: "instagram", body: "a".repeat(12001), planned_for: null }).success).toBe(false);
  });
});
