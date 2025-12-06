import {
  LayoutDashboard,
  Building2,
  Users,
  User,
  MessageSquare,
  BarChart3,
  FileBarChart,
  Filter,
  Shield,
  Lock,
  Settings,
  ListTree,
  CalendarDays,
  Calendar,
  Send,
} from 'lucide-react';
import { useLayout } from '@/context/layout-provider';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { NavLogo } from './nav-logo';
import { NavMenu } from './nav-menu';
import { NavUser } from './nav-user';
import type { NavMenuItems } from './types';

const menuItems: NavMenuItems = {
  items: [
    {
      title: 'Gösterge Paneli',
      url: '/',
      icon: LayoutDashboard,
      permission: 'dashboard_Access',
    },
    {
      title: 'Firmalar',
      url: '/organizations',
      icon: Building2,
      permission: 'organization_Access',
    },
    {
      title: 'Müşteriler',
      url: '/customers',
      icon: User,
      permission: 'customer_Access',
    },
    {
      title: 'Randevular',
      icon: Calendar,
      items: [
        {
          title: 'Randevular',
          url: '/appointments',
          icon: ListTree,
          permission: 'appointment_Access',
        },
        {
          title: 'Takvim',
          url: '/calendar',
          icon: CalendarDays,
          permission: 'calendar_Access',
        },
      ],
    },
    {
      title: 'Sohbetler',
      url: '/whatsapp-chats',
      icon: MessageSquare,
      permission: 'whatsapp_chat_Access',
    },
    {
      title: 'İstatistikler',
      icon: BarChart3,
      items: [
        {
          title: 'İstatistikler',
          url: '/statistics',
          icon: BarChart3,
          permission: 'statistic_Access',
        },
        {
          title: 'Raporlar',
          url: '/reports',
          icon: FileBarChart,
          permission: 'report_Access',
        },
      ],
    },
    {
      title: 'Segmentler',
      icon: Filter,
      items: [
        {
          title: 'Segmentler',
          url: '/segments',
          icon: Filter,
          permission: 'segment_Access',
        },
        {
          title: 'Kampanyalar',
          url: '/campaigns',
          icon: Send,
          anyPermission: [
            'whatsapp_message_status_Access',
            'email_message_status_Access',
          ],
        },
      ],
    },
    {
      title: 'Kullanıcılar',
      icon: Users,
      items: [
        {
          title: 'Kullanıcılar',
          url: '/users',
          icon: User,
          permission: 'user_Access',
        },
        {
          title: 'Roller',
          url: '/roles',
          icon: Shield,
          permission: 'role_Access',
        },
        {
          title: 'İzinler',
          url: '/permissions',
          icon: Lock,
          permission: 'permission_Access',
        },
      ],
    },
    {
      title: 'Ayarlar',
      icon: Settings,
      url: '/settings',
      permission: 'setting_Access',
    },
  ],
};

export function AppSidebar() {
  const { collapsible, variant } = useLayout();
  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <NavLogo />
      </SidebarHeader>
      <SidebarContent>
        <NavMenu items={menuItems.items} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
