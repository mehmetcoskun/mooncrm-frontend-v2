import { useQuery } from '@tanstack/react-query';
import { getTransfers } from '@/services/transfer-service';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { ThemeSwitch } from '@/components/theme-switch';
import { TransfersDialogs } from './components/transfers-dialogs';
import { TransfersPrimaryButtons } from './components/transfers-primary-buttons';
import { TransfersProvider } from './components/transfers-provider';
import { TransfersTable } from './components/transfers-table';

export function Transfers() {
  const {
    data: transfers = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['transfers'],
    queryFn: getTransfers,
  });

  return (
    <TransfersProvider>
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
              Transfer Yönetimi
            </h2>
            <p className="text-muted-foreground">
              Transferleri buradan yönetebilirsiniz.
            </p>
          </div>
          <TransfersPrimaryButtons />
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <TransfersTable data={transfers} isLoading={isLoading} />
        </div>
      </Main>

      <TransfersDialogs onSuccess={() => refetch()} />
    </TransfersProvider>
  );
}
