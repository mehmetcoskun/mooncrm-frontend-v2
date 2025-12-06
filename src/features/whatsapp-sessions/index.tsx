import { useQuery } from '@tanstack/react-query';
import { getWhatsappSessions } from '@/services/whatsapp-session-service';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { LeadSwitch } from '@/components/lead-switch';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { ThemeSwitch } from '@/components/theme-switch';
import { WhatsappSessionsDialogs } from './components/whatsapp-sessions-dialogs';
import { WhatsappSessionsPrimaryButtons } from './components/whatsapp-sessions-primary-buttons';
import { WhatsappSessionsProvider } from './components/whatsapp-sessions-provider';
import { WhatsappSessionsTable } from './components/whatsapp-sessions-table';

export function WhatsappSessions() {
  const {
    data: whatsappSessions = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['whatsapp-sessions'],
    queryFn: getWhatsappSessions,
  });

  return (
    <WhatsappSessionsProvider>
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
              WhatsApp Oturumları
            </h2>
            <p className="text-muted-foreground">
              WhatsApp oturumlarını buradan yönetebilirsiniz.
            </p>
          </div>
          <WhatsappSessionsPrimaryButtons />
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <WhatsappSessionsTable
            data={whatsappSessions}
            isLoading={isLoading}
          />
        </div>
      </Main>

      <WhatsappSessionsDialogs onSuccess={() => refetch()} />
    </WhatsappSessionsProvider>
  );
}
