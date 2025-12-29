import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { getCategories } from '@/services/category-service';
import { getCustomers } from '@/services/customer-service';
import { getServices } from '@/services/service-service';
import { getStatuses } from '@/services/status-service';
import { getUsers } from '@/services/user-service';
import {
  AdvancedFilterDialog,
  type FilterCondition,
} from '@/components/advanced-filter-dialog';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { LeadSwitch } from '@/components/lead-switch';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { ThemeSwitch } from '@/components/theme-switch';
import { CustomersDialogs } from './components/customers-dialogs';
import { CustomersPrimaryButtons } from './components/customers-primary-buttons';
import { CustomersProvider } from './components/customers-provider';
import { CustomersTable } from './components/customers-table';

export function Customers() {
  const navigate = useNavigate();
  const searchParams = useSearch({ from: '/_authenticated/customers/' });

  // URL'den state değerlerini oku
  const search = searchParams.search ?? '';
  const pagination = useMemo(
    () => ({
      pageIndex: searchParams.page ?? 0,
      pageSize: searchParams.pageSize ?? 10,
    }),
    [searchParams.page, searchParams.pageSize]
  );
  const filterObject = useMemo(
    () => searchParams.filterObject ?? {},
    [searchParams.filterObject]
  );
  const activeFilters = useMemo(
    () => (searchParams.filters ?? []) as FilterCondition[],
    [searchParams.filters]
  );
  const logicalOperator = searchParams.operator ?? 'and';

  // URL güncelleme fonksiyonları
  const setSearch = useCallback(
    (newSearch: string) => {
      navigate({
        to: '/customers',
        search: (prev) => ({
          ...prev,
          search: newSearch || undefined,
          page: 0, // Arama değişince sayfa sıfırlansın
        }),
        replace: true,
      });
    },
    [navigate]
  );

  const setPagination = useCallback(
    (
      updater:
        | { pageIndex: number; pageSize: number }
        | ((prev: { pageIndex: number; pageSize: number }) => {
            pageIndex: number;
            pageSize: number;
          })
    ) => {
      const newPagination =
        typeof updater === 'function' ? updater(pagination) : updater;
      navigate({
        to: '/customers',
        search: (prev) => ({
          ...prev,
          page: newPagination.pageIndex || undefined,
          pageSize:
            newPagination.pageSize !== 10 ? newPagination.pageSize : undefined,
        }),
        replace: true,
      });
    },
    [navigate, pagination]
  );

  const queryFilters = useMemo(() => {
    return {
      search,
      first: pagination.pageIndex * pagination.pageSize,
      rows: pagination.pageSize,
      ...filterObject,
    };
  }, [search, pagination, filterObject]);

  const handleApplyFilters = useCallback(
    (
      _queryString: string,
      filters: FilterCondition[],
      logicalOp: 'and' | 'or',
      queryParams: Record<string, unknown>
    ) => {
      navigate({
        to: '/customers',
        search: (prev) => ({
          ...prev,
          filters: filters.length > 0 ? filters : undefined,
          filterObject:
            Object.keys(queryParams).length > 0 ? queryParams : undefined,
          operator: logicalOp !== 'and' ? logicalOp : undefined,
          page: 0, // Filtre değişince sayfa sıfırlansın
        }),
        replace: true,
      });
    },
    [navigate]
  );

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['customers', queryFilters],
    queryFn: () => getCustomers(queryFilters),
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const { data: statuses } = useQuery({
    queryKey: ['statuses'],
    queryFn: getStatuses,
  });

  const { data: services } = useQuery({
    queryKey: ['services'],
    queryFn: getServices,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const customers = data?.data || [];
  const totalRecords = data?.totalRecords || 0;

  return (
    <CustomersProvider>
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
              Müşteri Yönetimi
            </h2>
            <p className="text-muted-foreground">
              Müşterileri buradan yönetebilirsiniz.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <AdvancedFilterDialog
              onApplyFilters={handleApplyFilters}
              initialFilters={activeFilters}
              initialLogicalOperator={logicalOperator}
              activeFilterCount={activeFilters.length}
            />
            <CustomersPrimaryButtons />
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <CustomersTable
            data={customers}
            isLoading={isLoading}
            isFetching={isFetching}
            search={search}
            onSearchChange={setSearch}
            pagination={pagination}
            setPagination={setPagination}
            totalRecords={totalRecords}
            users={users}
            statuses={statuses}
            services={services}
            categories={categories}
            refetch={refetch}
          />
        </div>
      </Main>

      <CustomersDialogs onSuccess={() => refetch()} />
    </CustomersProvider>
  );
}
