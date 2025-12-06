import { useQuery } from '@tanstack/react-query';
import { getHotels } from '@/services/hotel-service';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { LeadSwitch } from '@/components/lead-switch';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { ThemeSwitch } from '@/components/theme-switch';
import { HotelsDialogs } from './components/hotels-dialogs';
import { HotelsPrimaryButtons } from './components/hotels-primary-buttons';
import { HotelsProvider } from './components/hotels-provider';
import { HotelsTable } from './components/hotels-table';

export function Hotels() {
  const {
    data: hotels = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['hotels'],
    queryFn: getHotels,
  });

  return (
    <HotelsProvider>
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
            <h2 className="text-2xl font-bold tracking-tight">Otel Yönetimi</h2>
            <p className="text-muted-foreground">
              Otelleri buradan yönetebilirsiniz.
            </p>
          </div>
          <HotelsPrimaryButtons />
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <HotelsTable data={hotels} isLoading={isLoading} />
        </div>
      </Main>

      <HotelsDialogs onSuccess={() => refetch()} />
    </HotelsProvider>
  );
}
