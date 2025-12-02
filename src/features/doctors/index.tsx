import { useQuery } from '@tanstack/react-query';
import { getDoctors } from '@/services/doctor-service';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { ThemeSwitch } from '@/components/theme-switch';
import { DoctorsDialogs } from './components/doctors-dialogs';
import { DoctorsPrimaryButtons } from './components/doctors-primary-buttons';
import { DoctorsProvider } from './components/doctors-provider';
import { DoctorsTable } from './components/doctors-table';

export function Doctors() {
  const {
    data: doctors = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['doctors'],
    queryFn: getDoctors,
  });

  return (
    <DoctorsProvider>
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
              Doktor Yönetimi
            </h2>
            <p className="text-muted-foreground">
              Doktorları buradan yönetebilirsiniz.
            </p>
          </div>
          <DoctorsPrimaryButtons />
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <DoctorsTable data={doctors} isLoading={isLoading} />
        </div>
      </Main>

      <DoctorsDialogs onSuccess={() => refetch()} />
    </DoctorsProvider>
  );
}
