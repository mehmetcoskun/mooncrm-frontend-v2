import type { ReactNode } from 'react';

export interface PermissionCheckProps {
  permission?: string;
  permissions?: string[];
  anyPermission?: string[];
  roleId?: number;
  roleIds?: number[];
  anyRoleId?: number[];
}

export interface PermissionGuardProps extends PermissionCheckProps {
  fallback?: ReactNode;
  children: ReactNode;
}
