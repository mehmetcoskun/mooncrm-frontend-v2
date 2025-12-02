import type { Permission } from '@/features/permissions/data/schema';
import type { User } from '@/features/users/data/schema';

const SUPER_ROLE_ID = 1;
const SUPER_USER_ID = 1;

export function isSuperUser(user: User | null): boolean {
  if (!user) return false;

  if (user.id === SUPER_USER_ID) return true;

  return user.roles?.some((role) => role.id === SUPER_ROLE_ID) || false;
}

export function hasPermission(
  user: User | null,
  permissionSlug: string
): boolean {
  if (!user) return false;

  if (isSuperUser(user)) return true;

  if (!user.roles || user.roles.length === 0) return false;

  return user.roles.some((role) =>
    role.permissions?.some((permission) => permission.slug === permissionSlug)
  );
}

export function hasRoleById(user: User | null, roleId: number): boolean {
  if (!user) return false;

  if (isSuperUser(user)) return true;

  if (!user.roles || user.roles.length === 0) return false;

  return user.roles.some((role) => role.id === roleId);
}

export function hasAnyPermission(
  user: User | null,
  permissionSlugs: string[]
): boolean {
  if (!user) return false;

  if (isSuperUser(user)) return true;

  if (!user.roles || user.roles.length === 0 || !permissionSlugs.length)
    return false;

  return permissionSlugs.some((slug) => hasPermission(user, slug));
}

export function hasAnyRoleById(user: User | null, roleIds: number[]): boolean {
  if (!user) return false;

  if (isSuperUser(user)) return true;

  if (!user.roles || user.roles.length === 0 || !roleIds.length) return false;

  return roleIds.some((id) => hasRoleById(user, id));
}

export function hasAllPermissions(
  user: User | null,
  permissionSlugs: string[]
): boolean {
  if (!user) return false;

  if (isSuperUser(user)) return true;

  if (!user.roles || user.roles.length === 0 || !permissionSlugs.length)
    return false;

  return permissionSlugs.every((slug) => hasPermission(user, slug));
}

export function hasAllRolesById(user: User | null, roleIds: number[]): boolean {
  if (!user) return false;

  if (isSuperUser(user)) return true;

  if (!user.roles || user.roles.length === 0 || !roleIds.length) return false;

  return roleIds.every((id) => hasRoleById(user, id));
}

export function getAllUserPermissions(user: User | null): Permission[] {
  if (!user || !user.roles || user.roles.length === 0) {
    return [];
  }

  const permissionMap = new Map<number, Permission>();

  user.roles.forEach((role) => {
    role.permissions?.forEach((permission) => {
      permissionMap.set(permission.id, permission);
    });
  });

  return Array.from(permissionMap.values());
}

export function getUserPermissionsByCategory(
  user: User | null,
  categoryPrefix: string
): Permission[] {
  if (!user || !user.roles || user.roles.length === 0) {
    return [];
  }

  const allPermissions = getAllUserPermissions(user);
  return allPermissions.filter((permission) =>
    permission.slug.startsWith(categoryPrefix)
  );
}

export function hasPermissionInCategory(
  user: User | null,
  categoryPrefix: string
): boolean {
  if (!user) return false;

  if (isSuperUser(user)) return true;

  if (!user.roles || user.roles.length === 0) return false;

  const categoryPermissions = getUserPermissionsByCategory(
    user,
    categoryPrefix
  );
  return categoryPermissions.length > 0;
}
