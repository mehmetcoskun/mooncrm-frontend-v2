import { Outlet } from '@tanstack/react-router';
import { Palette, UserCog, Shield } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { ThemeSwitch } from '@/components/theme-switch';
import { SidebarNav } from './components/sidebar-nav';

const sidebarNavItems = [
  {
    title: 'Profil',
    href: '/account',
    icon: <UserCog size={18} />,
  },
  {
    title: 'Güvenlik',
    href: '/account/security',
    icon: <Shield size={18} />,
  },
  {
    title: 'Görünüm',
    href: '/account/appearance',
    icon: <Palette size={18} />,
  },
];

export function Account() {
  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <div className="ms-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fixed>
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Hesabım
          </h1>
          <p className="text-muted-foreground">
            Hesap ayarlarını ve görünümü özelleştirin.
          </p>
        </div>
        <Separator className="my-4 lg:my-6" />
        <div className="flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12">
          <aside className="top-0 lg:sticky lg:w-1/5">
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className="flex w-full overflow-y-hidden p-1">
            <Outlet />
          </div>
        </div>
      </Main>
    </>
  );
}
