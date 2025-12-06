import type { ReactNode, ComponentType } from 'react';
import { Navigate } from '@tanstack/react-router';
import type { PermissionCheckProps } from '@/types/permissions';
import { useAuth } from '@/hooks/use-auth';
import { usePermissions } from '@/hooks/use-permissions';

export function withPermissionRequired<P extends object>(
  Component: ComponentType<P>,
  options: PermissionCheckProps
) {
  return function PermissionRequiredComponent(props: P): ReactNode {
    const { user, isLoading } = useAuth();
    const {
      hasPermission,
      hasAllPermissions,
      hasAnyPermission,
      hasRole,
      hasAllRoles,
      hasAnyRole,
      isSuperUser,
    } = usePermissions();

    if (isLoading || (!user && !isLoading)) {
      if (!user) {
        return null;
      }
    }

    if (isSuperUser()) {
      return <Component {...props} />;
    }

    const {
      permission,
      permissions,
      anyPermission,
      roleId,
      roleIds,
      anyRoleId,
    } = options;

    const checkPermission = permission ? hasPermission(permission) : true;
    const checkPermissions = permissions
      ? hasAllPermissions(permissions)
      : true;
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
      return <Navigate to="/403" />;
    }

    return <Component {...props} />;
  };
}
