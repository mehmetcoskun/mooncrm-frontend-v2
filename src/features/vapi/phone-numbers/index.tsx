import { useQuery } from '@tanstack/react-query';
import { getVapiPhoneNumbers } from '@/services/vapi-service';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { ThemeSwitch } from '@/components/theme-switch';
import { PhoneNumbersDialogs } from './components/phone-numbers-dialogs';
import { PhoneNumbersPrimaryButtons } from './components/phone-numbers-primary-buttons';
import { PhoneNumbersProvider } from './components/phone-numbers-provider';
import { PhoneNumbersTable } from './components/phone-numbers-table';

export function PhoneNumbers() {
  const {
    data: phoneNumbers = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['vapiPhoneNumbers'],
    queryFn: getVapiPhoneNumbers,
  });

  return (
    <PhoneNumbersProvider>
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
              Telefon Numarası Yönetimi
            </h2>
            <p className="text-muted-foreground">
              Telefon numaralarını buradan yönetebilirsiniz.
            </p>
          </div>
          <PhoneNumbersPrimaryButtons />
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <PhoneNumbersTable data={phoneNumbers} isLoading={isLoading} />
        </div>
      </Main>

      <PhoneNumbersDialogs onSuccess={() => refetch()} />
    </PhoneNumbersProvider>
  );
}
