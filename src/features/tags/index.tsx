import { useQuery } from '@tanstack/react-query';
import { getTags } from '@/services/tag-service';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { LeadSwitch } from '@/components/lead-switch';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { ThemeSwitch } from '@/components/theme-switch';
import { TagsDialogs } from './components/tags-dialogs';
import { TagsPrimaryButtons } from './components/tags-primary-buttons';
import { TagsProvider } from './components/tags-provider';
import { TagsTable } from './components/tags-table';

export function Tags() {
  const {
    data: tags = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['tags'],
    queryFn: getTags,
  });

  return (
    <TagsProvider>
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
              Etiket Yönetimi
            </h2>
            <p className="text-muted-foreground">
              Etiketleri buradan yönetebilirsiniz.
            </p>
          </div>
          <TagsPrimaryButtons />
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <TagsTable data={tags} isLoading={isLoading} />
        </div>
      </Main>

      <TagsDialogs onSuccess={() => refetch()} />
    </TagsProvider>
  );
}
