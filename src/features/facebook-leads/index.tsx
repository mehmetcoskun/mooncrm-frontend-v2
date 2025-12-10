import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getFacebookLeads } from '@/services/facebook-lead-service';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { LeadSwitch } from '@/components/lead-switch';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { ThemeSwitch } from '@/components/theme-switch';
import { FacebookLeadsDialogs } from './components/facebook-leads-dialogs';
import { FacebookLeadsProvider } from './components/facebook-leads-provider';
import { FacebookLeadsTable } from './components/facebook-leads-table';

export function FacebookLeads() {
  const [pageSize, setPageSize] = useState(10);
  const [cursor, setCursor] = useState<{
    after?: string;
    before?: string;
  }>({});

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['facebook-leads', pageSize, cursor],
    queryFn: () =>
      getFacebookLeads({
        limit: pageSize,
        after: cursor.after,
        before: cursor.before,
      }),
  });

  const leads = data?.data || [];
  const paging = data?.paging;

  const handleNextPage = () => {
    if (paging?.cursors?.after) {
      setCursor({ after: paging.cursors.after, before: undefined });
    }
  };

  const handlePreviousPage = () => {
    if (paging?.cursors?.before) {
      setCursor({ before: paging.cursors.before, after: undefined });
    }
  };

  const handleFirstPage = () => {
    setCursor({});
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCursor({});
  };

  return (
    <FacebookLeadsProvider>
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
              Facebook Lead'leri
            </h2>
            <p className="text-muted-foreground">
              Facebook'tan gelen tüm lead'leri buradan görüntüleyebilirsiniz.
            </p>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <FacebookLeadsTable
            data={leads}
            isLoading={isLoading}
            isFetching={isFetching}
            refetch={refetch}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
            hasNextPage={!!paging?.next}
            hasPreviousPage={!!cursor.after || !!cursor.before}
            onNextPage={handleNextPage}
            onPreviousPage={handlePreviousPage}
            onFirstPage={handleFirstPage}
          />
        </div>
      </Main>

      <FacebookLeadsDialogs />
    </FacebookLeadsProvider>
  );
}
