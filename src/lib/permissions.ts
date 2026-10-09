export const roles = ["viewer", "editor", "approver", "admin"] as const;
export type Role = (typeof roles)[number];
export type Permission = "read" | "edit" | "approve" | "manage_team";

const permissions: Record<Role, readonly Permission[]> = {
  viewer: ["read"],
  editor: ["read", "edit"],
  approver: ["read", "approve"],
  admin: ["read", "edit", "approve", "manage_team"],
};

export const roleLabels: Record<Role, string> = {
  viewer: "Leitura",
  editor: "Edição",
  approver: "Aprovação",
  admin: "Administração",
};

export function can(role: Role, permission: Permission) {
  return permissions[role].includes(permission);
}
