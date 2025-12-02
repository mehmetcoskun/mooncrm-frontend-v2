import { type LinkProps } from '@tanstack/react-router';

type BaseNavItem = {
  title: string;
  badge?: string;
  icon?: React.ElementType;
  permission?: string; // Gerekli yetki
  permissions?: string[]; // Gerekli yetkilerin tümü (AND)
  anyPermission?: string[]; // Gerekli yetkilerden en az biri (OR)
  roleId?: number; // Gerekli rol ID'si
  roleIds?: number[]; // Gerekli rol ID'lerinin tümü (AND)
  anyRoleId?: number[]; // Gerekli rol ID'lerinden en az biri (OR)
};

type NavLink = BaseNavItem & {
  url: LinkProps['to'] | (string & {});
  items?: never;
};

type NavCollapsible = BaseNavItem & {
  items: (BaseNavItem & { url: LinkProps['to'] | (string & {}) })[];
  url?: never;
};

type NavItem = NavCollapsible | NavLink;

type NavMenuItems = {
  items: NavItem[];
};

export type { NavMenuItems, NavItem, NavCollapsible, NavLink };
