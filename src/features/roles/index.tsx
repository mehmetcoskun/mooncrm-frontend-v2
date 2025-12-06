import { useQuery } from '@tanstack/react-query';
import { getRoles } from '@/services/role-service';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { LeadSwitch } from '@/components/lead-switch';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { ThemeSwitch } from '@/components/theme-switch';
import { RolesDialogs } from './components/roles-dialogs';
import { RolesPrimaryButtons } from './components/roles-primary-buttons';
import { RolesProvider } from './components/roles-provider';
import { RolesTable } from './components/roles-table';

export function Roles() {
  const {
    data: roles = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['roles'],
    queryFn: getRoles,
  });

  return (
    <RolesProvider>
      <Header fixed>
        <div className="ms-auto flex items-center space-x-4">
          <LeadSwitch />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fluid>
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Rol Yönetimi</h2>
            <p className="text-muted-foreground">
              Rolleri buradan yönetebilirsiniz.
            </p>
          </div>
          <RolesPrimaryButtons />
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <RolesTable data={roles} isLoading={isLoading} />
        </div>
      </Main>

      <RolesDialogs onSuccess={() => refetch()} />
    </RolesProvider>
  );
}
