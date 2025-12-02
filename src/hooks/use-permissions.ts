import {
  hasPermission,
  hasRoleById,
  hasAnyPermission,
  hasAnyRoleById,
  hasAllPermissions,
  hasAllRolesById,
  getAllUserPermissions,
  getUserPermissionsByCategory,
  hasPermissionInCategory,
  isSuperUser,
} from '@/utils/permissions';
import { useAuth } from './use-auth';

export function usePermissions() {
  const { user } = useAuth();

  return {
    isSuperUser: () => isSuperUser(user),
    hasPermission: (permissionSlug: string) =>
      hasPermission(user, permissionSlug),
    hasRole: (roleId: number) => hasRoleById(user, roleId),
    hasAnyPermission: (permissionSlugs: string[]) =>
      hasAnyPermission(user, permissionSlugs),
    hasAnyRole: (roleIds: number[]) => hasAnyRoleById(user, roleIds),
    hasAllPermissions: (permissionSlugs: string[]) =>
      hasAllPermissions(user, permissionSlugs),
    hasAllRoles: (roleIds: number[]) => hasAllRolesById(user, roleIds),
    getAllPermissions: () => getAllUserPermissions(user),
    getPermissionsByCategory: (categoryPrefix: string) =>
      getUserPermissionsByCategory(user, categoryPrefix),
    hasPermissionInCategory: (categoryPrefix: string) =>
      hasPermissionInCategory(user, categoryPrefix),
  };
}
