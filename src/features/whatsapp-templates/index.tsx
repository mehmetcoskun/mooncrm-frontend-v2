import { useQuery } from '@tanstack/react-query';
import { getWhatsappTemplates } from '@/services/whatsapp-template-service';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { LeadSwitch } from '@/components/lead-switch';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { ThemeSwitch } from '@/components/theme-switch';
import { WhatsappTemplatesDialogs } from './components/whatsapp-templates-dialogs';
import { WhatsappTemplatesPrimaryButtons } from './components/whatsapp-templates-primary-buttons';
import { WhatsappTemplatesProvider } from './components/whatsapp-templates-provider';
import { WhatsappTemplatesTable } from './components/whatsapp-templates-table';

export function WhatsappTemplates() {
  const {
    data: whatsappTemplates = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['whatsapp-templates'],
    queryFn: getWhatsappTemplates,
  });

  return (
    <WhatsappTemplatesProvider>
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
              WhatsApp Şablon Yönetimi
            </h2>
            <p className="text-muted-foreground">
              WhatsApp şablonlarını buradan yönetebilirsiniz.
            </p>
          </div>
          <WhatsappTemplatesPrimaryButtons />
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <WhatsappTemplatesTable
            data={whatsappTemplates}
            isLoading={isLoading}
          />
        </div>
      </Main>

      <WhatsappTemplatesDialogs onSuccess={() => refetch()} />
    </WhatsappTemplatesProvider>
  );
}
