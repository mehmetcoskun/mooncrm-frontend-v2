import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getStatistics } from '@/services/statistics-service';
import { BarChart3, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AdvancedFilterDialog,
  type FilterCondition,
} from '@/components/advanced-filter-dialog';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { LeadSwitch } from '@/components/lead-switch';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { ThemeSwitch } from '@/components/theme-switch';
import { StatisticsTable } from './components/statistics-table';
import { type Statistic } from './data/schema';

export function Statistics() {
  const [filterObject, setFilterObject] = useState<Record<string, unknown>>({});
  const [activeFilters, setActiveFilters] = useState<FilterCondition[]>([]);
  const [logicalOperator, setLogicalOperator] = useState<'and' | 'or'>('and');

  const {
    data: statisticsData,
    isLoading,
    error,
  } = useQuery<Statistic[]>({
    queryKey: ['statistics', filterObject],
    queryFn: () => getStatistics(filterObject),
  });

  const handleApplyFilters = (
    _queryString: string,
    filters: FilterCondition[],
    logicalOp: 'and' | 'or',
    queryParams: Record<string, unknown>
  ) => {
    setFilterObject(queryParams);
    setActiveFilters(filters);
    setLogicalOperator(logicalOp);
  };

  const totalStats = statisticsData?.reduce(
    (acc, item) => ({
      contacts: acc.contacts + item.contacts.total,
      offers: acc.offers + item.offers.total,
      sales: acc.sales + item.sales.total,
      canceled: acc.canceled + item.canceled.total,
    }),
    { contacts: 0, offers: 0, sales: 0, canceled: 0 }
  );

  const percentages = useMemo(() => {
    if (!totalStats) return null;
    const { contacts, offers, sales, canceled } = totalStats;
    return {
      offerRate: contacts > 0 ? (offers / contacts) * 100 : 0,
      salesRate: offers > 0 ? (sales / offers) * 100 : 0,
      cancelRate: offers > 0 ? (canceled / offers) * 100 : 0,
      conversionRate: contacts > 0 ? (sales / contacts) * 100 : 0,
    };
  }, [totalStats]);

  return (
    <>
      <Header fixed>
        <div className="ml-auto flex items-center space-x-4">
          <LeadSwitch />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fluid>
        {isLoading ? (
          <div className="space-y-6">
            <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
              <div>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="mt-2 h-5 w-72" />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="mt-2 h-3 w-32" />
                    <Skeleton className="mt-2 h-4 w-28" />
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-64" />
                <Skeleton className="mt-2 h-4 w-80" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : error ? (
          <div className="p-6">
            <Alert variant="destructive">
              <AlertDescription>
                İstatistikler yüklenirken bir hata oluştu. Lütfen tekrar
                deneyin.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  İstatistikler
                </h2>
                <p className="text-muted-foreground">
                  Kaynak türlerine göre detaylı istatistik raporu
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-muted-foreground flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Genel Bakış</span>
                </div>
                <AdvancedFilterDialog
                  onApplyFilters={handleApplyFilters}
                  initialFilters={activeFilters}
                  initialLogicalOperator={logicalOperator}
                  activeFilterCount={activeFilters.length}
                />
              </div>
            </div>

            {totalStats && percentages && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Toplam İletişim
                    </CardTitle>
                    <TrendingUp className="text-muted-foreground h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {totalStats.contacts.toLocaleString()}
                    </div>
                    <p className="text-muted-foreground text-xs">
                      Tüm kaynaklardan gelen iletişimler
                    </p>
                    <div className="mt-1 text-sm font-medium text-blue-600">
                      %{percentages.conversionRate.toFixed(1)} dönüşüm oranı
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Toplam Teklif
                    </CardTitle>
                    <TrendingUp className="text-muted-foreground h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {totalStats.offers.toLocaleString()}
                    </div>
                    <p className="text-muted-foreground text-xs">
                      Verilen teklif sayısı
                    </p>
                    <div className="mt-1 text-sm font-medium text-orange-600">
                      %{percentages.offerRate.toFixed(1)} teklif oranı
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Toplam Satış
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {totalStats.sales.toLocaleString()}
                    </div>
                    <p className="text-muted-foreground text-xs">
                      Başarılı satış sayısı
                    </p>
                    <div className="mt-1 text-sm font-medium text-green-600">
                      %{percentages.salesRate.toFixed(1)} kapanma oranı
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      İptal Edilen
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {totalStats.canceled.toLocaleString()}
                    </div>
                    <p className="text-muted-foreground text-xs">
                      İptal edilen işlem sayısı
                    </p>
                    <div className="mt-1 text-sm font-medium text-red-600">
                      %{percentages.cancelRate.toFixed(1)} iptal oranı
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Kaynak Türü Bazında Detaylı İstatistikler</CardTitle>
                <CardDescription>
                  Her kaynak türü için iletişim, teklif, satış ve iptal
                  istatistikleri
                </CardDescription>
              </CardHeader>
              <CardContent>
                {statisticsData && statisticsData.length > 0 ? (
                  <StatisticsTable data={statisticsData} />
                ) : (
                  <div className="text-muted-foreground py-8 text-center">
                    Henüz istatistik verisi bulunmuyor.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </Main>
    </>
  );
}
