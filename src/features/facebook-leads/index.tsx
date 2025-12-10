import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getFacebookForms,
  getFacebookLeads,
  getFacebookPages,
} from '@/services/facebook-lead-service';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { LeadSwitch } from '@/components/lead-switch';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { SearchableSelect } from '@/components/searchable-select';
import { ThemeSwitch } from '@/components/theme-switch';
import { FacebookLeadsDialogs } from './components/facebook-leads-dialogs';
import { FacebookLeadsProvider } from './components/facebook-leads-provider';
import { FacebookLeadsTable } from './components/facebook-leads-table';
import type { FacebookForm, FacebookPage } from './data/schema';

export function FacebookLeads() {
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [cursor, setCursor] = useState<{
    after?: string;
    before?: string;
  }>({});

  const { data: pagesData, isLoading: isPagesLoading } = useQuery({
    queryKey: ['facebook-pages'],
    queryFn: getFacebookPages,
  });

  const pages: FacebookPage[] = pagesData?.data || [];

  useEffect(() => {
    if (pages.length > 0 && !selectedPageId) {
      setSelectedPageId(pages[0].id);
    }
  }, [pages, selectedPageId]);

  const { data: formsData, isLoading: isFormsLoading } = useQuery({
    queryKey: ['facebook-forms', selectedPageId],
    queryFn: () => getFacebookForms(selectedPageId!),
    enabled: !!selectedPageId,
  });

  const forms: FacebookForm[] = formsData?.data || [];

  useEffect(() => {
    if (forms.length > 0 && !selectedFormId) {
      setSelectedFormId(forms[0].id);
    }
  }, [forms, selectedFormId]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [
      'facebook-leads',
      selectedPageId,
      selectedFormId,
      pageSize,
      cursor,
    ],
    queryFn: () =>
      getFacebookLeads({
        page_id: selectedPageId!,
        form_id: selectedFormId!,
        limit: pageSize,
        after: cursor.after,
        before: cursor.before,
      }),
    enabled: !!selectedPageId && !!selectedFormId,
  });

  const leads = data?.data || [];
  const paging = data?.paging;

  const handlePageChange = (pageId: string) => {
    setSelectedPageId(pageId);
    setSelectedFormId(null);
    setCursor({});
  };

  const handleFormChange = (formId: string) => {
    setSelectedFormId(formId);
    setCursor({});
  };

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
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-2 sm:flex-initial">
              <span className="w-12 text-sm font-medium sm:w-auto">Sayfa:</span>
              <SearchableSelect
                value={selectedPageId || ''}
                onValueChange={handlePageChange}
                disabled={pages.length === 0}
                isPending={isPagesLoading}
                placeholder="Sayfa seçin"
                searchPlaceholder="Sayfa ara..."
                emptyMessage="Sayfa bulunamadı."
                items={pages.map((page) => ({
                  label: page.name,
                  value: page.id,
                }))}
                className="flex-1 sm:flex-initial"
              />
            </div>
            <div className="flex flex-1 items-center gap-2 sm:flex-initial">
              <span className="w-12 text-sm font-medium sm:w-auto">Form:</span>
              <SearchableSelect
                value={selectedFormId || ''}
                onValueChange={handleFormChange}
                disabled={!selectedPageId || forms.length === 0}
                isPending={isFormsLoading}
                placeholder={
                  !selectedPageId
                    ? 'Önce sayfa seçin'
                    : forms.length === 0
                      ? 'Form bulunamadı'
                      : 'Form seçin'
                }
                searchPlaceholder="Form ara..."
                emptyMessage="Form bulunamadı."
                items={forms.map((form) => ({
                  label: form.name,
                  value: form.id,
                }))}
                className="flex-1 sm:flex-initial"
              />
            </div>
          </div>
        </div>

        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <FacebookLeadsTable
            data={leads}
            isLoading={isLoading || isPagesLoading || isFormsLoading}
            isFetching={isFetching}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
            hasNextPage={!!paging?.next}
            hasPreviousPage={!!cursor.after || !!cursor.before}
            onNextPage={handleNextPage}
            onPreviousPage={handlePreviousPage}
            onFirstPage={handleFirstPage}
            refetch={refetch}
          />
        </div>
      </Main>

      <FacebookLeadsDialogs />
    </FacebookLeadsProvider>
  );
}
