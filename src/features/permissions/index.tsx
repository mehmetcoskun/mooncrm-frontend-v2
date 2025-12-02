import { useQuery } from '@tanstack/react-query';
import { getPermissions } from '@/services/permission-service';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { ThemeSwitch } from '@/components/theme-switch';
import { PermissionsDialogs } from './components/permissions-dialogs';
import { PermissionsPrimaryButtons } from './components/permissions-primary-buttons';
import { PermissionsProvider } from './components/permissions-provider';
import { PermissionsTable } from './components/permissions-table';

export function Permissions() {
  const {
    data: permissions = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['permissions'],
    queryFn: getPermissions,
  });

  return (
    <PermissionsProvider>
      <Header fixed>
        <div className="ms-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fluid>
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">İzin Yönetimi</h2>
            <p className="text-muted-foreground">
              İzinleri buradan yönetebilirsiniz.
            </p>
          </div>
          <PermissionsPrimaryButtons />
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <PermissionsTable data={permissions} isLoading={isLoading} />
        </div>
      </Main>

      <PermissionsDialogs onSuccess={() => refetch()} />
    </PermissionsProvider>
  );
}
