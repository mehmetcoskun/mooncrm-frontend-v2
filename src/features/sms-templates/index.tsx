import { useQuery } from '@tanstack/react-query';
import { getSmsTemplates } from '@/services/sms-template-service';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { LeadSwitch } from '@/components/lead-switch';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { ThemeSwitch } from '@/components/theme-switch';
import { SmsTemplatesDialogs } from './components/sms-templates-dialogs';
import { SmsTemplatesPrimaryButtons } from './components/sms-templates-primary-buttons';
import { SmsTemplatesProvider } from './components/sms-templates-provider';
import { SmsTemplatesTable } from './components/sms-templates-table';

export function SmsTemplates() {
  const {
    data: smsTemplates = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['sms-templates'],
    queryFn: getSmsTemplates,
  });

  return (
    <SmsTemplatesProvider>
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
            <h2 className="text-2xl font-bold tracking-tight">
              SMS Şablon Yönetimi
            </h2>
            <p className="text-muted-foreground">
              SMS şablonlarını buradan yönetebilirsiniz.
            </p>
          </div>
          <SmsTemplatesPrimaryButtons />
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <SmsTemplatesTable data={smsTemplates} isLoading={isLoading} />
        </div>
      </Main>

      <SmsTemplatesDialogs onSuccess={() => refetch()} />
    </SmsTemplatesProvider>
  );
}
