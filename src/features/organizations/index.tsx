import { useQuery } from '@tanstack/react-query';
import { getOrganizations } from '@/services/organization-service';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { ThemeSwitch } from '@/components/theme-switch';
import { OrganizationsDialogs } from './components/organizations-dialogs';
import { OrganizationsPrimaryButtons } from './components/organizations-primary-buttons';
import { OrganizationsProvider } from './components/organizations-provider';
import { OrganizationsTable } from './components/organizations-table';

export function Organizations() {
  const {
    data: organizations = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['organizations'],
    queryFn: getOrganizations,
  });

  return (
    <OrganizationsProvider>
      <Header fixed>
        <div className="ms-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fluid>
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Firma Yönetimi
            </h2>
            <p className="text-muted-foreground">
              Firmaları buradan yönetebilirsiniz.
            </p>
          </div>
          <OrganizationsPrimaryButtons />
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <OrganizationsTable data={organizations} isLoading={isLoading} />
        </div>
      </Main>

      <OrganizationsDialogs onSuccess={() => refetch()} />
    </OrganizationsProvider>
  );
}
