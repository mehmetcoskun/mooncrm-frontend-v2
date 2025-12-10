import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getFacebookForms,
  getFacebookLeads,
  getFacebookPages,
} from '@/services/facebook-lead-service';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { LeadSwitch } from '@/components/lead-switch';
import { ProfileDropdown } from '@/components/profile-dropdown';
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
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Sayfa:</span>
            <Select
              value={selectedPageId || ''}
              onValueChange={handlePageChange}
              disabled={isPagesLoading || pages.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={isPagesLoading ? 'Yükleniyor...' : 'Sayfa seçin'}
                />
              </SelectTrigger>
              <SelectContent>
                {pages.map((page) => (
                  <SelectItem key={page.id} value={page.id}>
                    {page.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm font-medium">Form:</span>
            <Select
              value={selectedFormId || ''}
              onValueChange={handleFormChange}
              disabled={!selectedPageId || isFormsLoading || forms.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    !selectedPageId
                      ? 'Önce sayfa seçin'
                      : isFormsLoading
                        ? 'Yükleniyor...'
                        : forms.length === 0
                          ? 'Form bulunamadı'
                          : 'Form seçin'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {forms.map((form) => (
                  <SelectItem key={form.id} value={form.id}>
                    {form.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
