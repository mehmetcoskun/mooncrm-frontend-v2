import { useQuery } from '@tanstack/react-query';
import { getStatuses } from '@/services/status-service';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { ThemeSwitch } from '@/components/theme-switch';
import { StatusesDialogs } from './components/statuses-dialogs';
import { StatusesPrimaryButtons } from './components/statuses-primary-buttons';
import { StatusesProvider } from './components/statuses-provider';
import { StatusesTable } from './components/statuses-table';

export function Statuses() {
  const {
    data: statuses = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['statuses'],
    queryFn: getStatuses,
  });

  return (
    <StatusesProvider>
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
              Durum Yönetimi
            </h2>
            <p className="text-muted-foreground">
              Durumları buradan yönetebilirsiniz.
            </p>
          </div>
          <StatusesPrimaryButtons />
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <StatusesTable data={statuses} isLoading={isLoading} />
        </div>
      </Main>

      <StatusesDialogs onSuccess={() => refetch()} />
    </StatusesProvider>
  );
}
