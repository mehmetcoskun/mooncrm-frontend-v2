import type { PermissionGuardProps } from '@/types/permissions';
import { usePermissions } from '@/hooks/use-permissions';

export function PermissionGuard({
  permission,
  permissions,
  anyPermission,
  roleId,
  roleIds,
  anyRoleId,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const {
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    hasRole,
    hasAllRoles,
    hasAnyRole,
    isSuperUser,
  } = usePermissions();

  if (isSuperUser()) return <>{children}</>;

  const checkPermission = permission ? hasPermission(permission) : true;
  const checkPermissions = permissions ? hasAllPermissions(permissions) : true;
  const checkAnyPermission = anyPermission
    ? hasAnyPermission(anyPermission)
    : true;

  const checkRoleId = roleId ? hasRole(roleId) : true;
  const checkRoleIds = roleIds ? hasAllRoles(roleIds) : true;
  const checkAnyRoleId = anyRoleId ? hasAnyRole(anyRoleId) : true;

  const hasAccess =
    checkPermission &&
    checkPermissions &&
    checkAnyPermission &&
    checkRoleId &&
    checkRoleIds &&
    checkAnyRoleId;

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
