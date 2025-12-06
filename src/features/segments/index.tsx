import { useQuery } from '@tanstack/react-query';
import { getSegments } from '@/services/segment-service';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { LeadSwitch } from '@/components/lead-switch';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { ThemeSwitch } from '@/components/theme-switch';
import { SegmentsDialogs } from './components/segments-dialogs';
import { SegmentsPrimaryButtons } from './components/segments-primary-buttons';
import { SegmentsProvider } from './components/segments-provider';
import { SegmentsTable } from './components/segments-table';

export function Segments() {
  const {
    data: segments = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['segments'],
    queryFn: getSegments,
  });

  return (
    <SegmentsProvider>
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
              Segment Yönetimi
            </h2>
            <p className="text-muted-foreground">
              Segmentleri buradan yönetebilirsiniz.
            </p>
          </div>
          <SegmentsPrimaryButtons />
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <SegmentsTable data={segments} isLoading={isLoading} />
        </div>
      </Main>

      <SegmentsDialogs onSuccess={() => refetch()} />
    </SegmentsProvider>
  );
}
