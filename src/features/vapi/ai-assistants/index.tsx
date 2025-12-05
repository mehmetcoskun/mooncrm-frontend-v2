import { useQuery } from '@tanstack/react-query';
import { getVapiAiAssistants } from '@/services/vapi-service';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { ThemeSwitch } from '@/components/theme-switch';
import { AiAssistantsDialogs } from './components/ai-assistants-dialogs';
import { AiAssistantsPrimaryButtons } from './components/ai-assistants-primary-buttons';
import { AiAssistantsProvider } from './components/ai-assistants-provider';
import { AiAssistantsTable } from './components/ai-assistants-table';

export function AiAssistants() {
  const {
    data: vapiAiAssistants = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['vapiAiAssistants'],
    queryFn: getVapiAiAssistants,
  });

  return (
    <AiAssistantsProvider>
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
              AI Asistan Yönetimi
            </h2>
            <p className="text-muted-foreground">
              AI Asistanları buradan yönetebilirsiniz.
            </p>
          </div>
          <AiAssistantsPrimaryButtons />
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <AiAssistantsTable data={vapiAiAssistants} isLoading={isLoading} />
        </div>
      </Main>

      <AiAssistantsDialogs onSuccess={() => refetch()} />
    </AiAssistantsProvider>
  );
}
