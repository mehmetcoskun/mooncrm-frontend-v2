import { useQuery } from '@tanstack/react-query';
import { getEmailTemplates } from '@/services/email-template-service';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { ThemeSwitch } from '@/components/theme-switch';
import { EmailTemplatesDialogs } from './components/email-templates-dialogs';
import { EmailTemplatesPrimaryButtons } from './components/email-templates-primary-buttons';
import { EmailTemplatesProvider } from './components/email-templates-provider';
import { EmailTemplatesTable } from './components/email-templates-table';

export function EmailTemplates() {
  const {
    data: emailTemplates = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['email-templates'],
    queryFn: getEmailTemplates,
  });

  return (
    <EmailTemplatesProvider>
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
              E-Posta Şablon Yönetimi
            </h2>
            <p className="text-muted-foreground">
              E-Posta şablonlarını buradan yönetebilirsiniz.
            </p>
          </div>
          <EmailTemplatesPrimaryButtons />
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <EmailTemplatesTable data={emailTemplates} isLoading={isLoading} />
        </div>
      </Main>

      <EmailTemplatesDialogs onSuccess={() => refetch()} />
    </EmailTemplatesProvider>
  );
}
