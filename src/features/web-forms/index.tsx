import { useQuery } from '@tanstack/react-query';
import { getWebForms } from '@/services/web-form-service';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { ThemeSwitch } from '@/components/theme-switch';
import { WebFormsDialogs } from './components/web-forms-dialogs';
import { WebFormsPrimaryButtons } from './components/web-forms-primary-buttons';
import { WebFormsProvider } from './components/web-forms-provider';
import { WebFormsTable } from './components/web-forms-table';

export function WebForms() {
  const {
    data: webForms = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['webForms'],
    queryFn: getWebForms,
  });

  return (
    <WebFormsProvider>
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
              Web Formu Yönetimi
            </h2>
            <p className="text-muted-foreground">
              Web formlarını buradan yönetebilirsiniz.
            </p>
          </div>
          <WebFormsPrimaryButtons />
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <WebFormsTable data={webForms} isLoading={isLoading} />
        </div>
      </Main>

      <WebFormsDialogs onSuccess={() => refetch()} />
    </WebFormsProvider>
  );
}
