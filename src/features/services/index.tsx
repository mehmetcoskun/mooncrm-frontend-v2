import { useQuery } from '@tanstack/react-query';
import { getServices } from '@/services/service-service';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { ThemeSwitch } from '@/components/theme-switch';
import { ServicesDialogs } from './components/services-dialogs';
import { ServicesPrimaryButtons } from './components/services-primary-buttons';
import { ServicesProvider } from './components/services-provider';
import { ServicesTable } from './components/services-table';

export function Services() {
  const {
    data: services = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['services'],
    queryFn: getServices,
  });

  return (
    <ServicesProvider>
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
              Hizmet Yönetimi
            </h2>
            <p className="text-muted-foreground">
              Hizmetleri buradan yönetebilirsiniz.
            </p>
          </div>
          <ServicesPrimaryButtons />
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <ServicesTable data={services} isLoading={isLoading} />
        </div>
      </Main>

      <ServicesDialogs onSuccess={() => refetch()} />
    </ServicesProvider>
  );
}
