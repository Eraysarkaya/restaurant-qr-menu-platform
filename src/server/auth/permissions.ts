import type { UserRole } from "@/generated/prisma/enums";

export type Permission =
  | "ADMIN_ACCESS"
  | "MENU_MANAGE"
  | "SETTINGS_MANAGE"
  | "STAFF_MANAGE";

const rolePermissions: Record<UserRole, ReadonlySet<Permission>> = {
  OWNER: new Set<Permission>([
    "ADMIN_ACCESS", "MENU_MANAGE", "SETTINGS_MANAGE", "STAFF_MANAGE",
  ]),
  EDITOR: new Set<Permission>(["ADMIN_ACCESS", "MENU_MANAGE"]),
};

export function hasPermission(role: UserRole, permission: Permission) {
  return rolePermissions[role].has(permission);
}

export function roleHome() {
  return "/admin";
}
