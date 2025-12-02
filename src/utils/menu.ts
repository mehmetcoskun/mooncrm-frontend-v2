import type { NavItem, NavMenuItems } from '@/components/layout/types';
import type { User } from '@/features/users/data/schema';
import {
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  hasRoleById,
  hasAllRolesById,
  hasAnyRoleById,
  isSuperUser,
} from './permissions';

export function canAccessMenuItem(item: NavItem, user: User | null): boolean {
  if (!user) {
    return false;
  }

  if (isSuperUser(user)) {
    return true;
  }

  const checkPermission = item.permission
    ? hasPermission(user, item.permission)
    : true;
  const checkPermissions = item.permissions
    ? hasAllPermissions(user, item.permissions)
    : true;
  const checkAnyPermission = item.anyPermission
    ? hasAnyPermission(user, item.anyPermission)
    : true;

  const checkRoleId = item.roleId ? hasRoleById(user, item.roleId) : true;
  const checkRoleIds = item.roleIds
    ? hasAllRolesById(user, item.roleIds)
    : true;
  const checkAnyRoleId = item.anyRoleId
    ? hasAnyRoleById(user, item.anyRoleId)
    : true;

  return (
    checkPermission &&
    checkPermissions &&
    checkAnyPermission &&
    checkRoleId &&
    checkRoleIds &&
    checkAnyRoleId
  );
}

export function filterMenuByPermissions(
  menu: NavMenuItems,
  user: User | null
): NavMenuItems {
  if (!user) {
    return { items: [] };
  }

  if (isSuperUser(user)) {
    return menu;
  }

  const filteredItems = menu.items
    .map((item) => {
      if (!canAccessMenuItem(item, user)) {
        return null;
      }

      if ('items' in item && item.items) {
        const filteredSubItems = item.items.filter((subItem) =>
          canAccessMenuItem(subItem as NavItem, user)
        );

        if (filteredSubItems.length === 0) {
          return null;
        }

        return {
          ...item,
          items: filteredSubItems,
        };
      }

      return item;
    })
    .filter(Boolean) as NavItem[];

  return {
    items: filteredItems,
  };
}
