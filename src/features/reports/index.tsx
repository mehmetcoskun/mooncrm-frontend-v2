import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getReports } from '@/services/report-service';
import { Users, Trophy, TrendingUp, Target } from 'lucide-react';
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
import { ReportsTable } from './components/reports-table';
import { type Report } from './data/schema';

export function Reports() {
  const [filterObject, setFilterObject] = useState<Record<string, unknown>>({});
  const [activeFilters, setActiveFilters] = useState<FilterCondition[]>([]);
  const [logicalOperator, setLogicalOperator] = useState<'and' | 'or'>('and');

  const {
    data: reportsData,
    isLoading,
    error,
  } = useQuery<Report[]>({
    queryKey: ['reports', filterObject],
    queryFn: () => getReports(filterObject),
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

  const totalStats = reportsData?.reduce(
    (acc, item) => ({
      contacts: acc.contacts + item.contacts.total,
      offers: acc.offers + item.offers.total,
      sales: acc.sales + item.sales.total,
      canceled: acc.canceled + item.canceled.total,
    }),
    { contacts: 0, offers: 0, sales: 0, canceled: 0 }
  );

  const topPerformers = reportsData
    ?.slice()
    .sort((a, b) => b.sales.total - a.sales.total)
    .slice(0, 3);

  const averageStats =
    reportsData && reportsData.length > 0
      ? {
          avgContacts: totalStats!.contacts / reportsData.length,
          avgOffers: totalStats!.offers / reportsData.length,
          avgSales: totalStats!.sales / reportsData.length,
          avgConversionRate:
            totalStats!.contacts > 0
              ? (totalStats!.sales / totalStats!.contacts) * 100
              : 0,
        }
      : null;

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
                <Skeleton className="h-8 w-56" />
                <Skeleton className="mt-2 h-5 w-80" />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="mt-2 h-3 w-36" />
                    <Skeleton className="mt-2 h-4 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-64" />
                <Skeleton className="mt-2 h-4 w-72" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="rounded-lg border p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <Skeleton className="h-3 w-12" />
                          <Skeleton className="h-3 w-8" />
                        </div>
                        <div className="flex justify-between">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-3 w-12" />
                        </div>
                        <div className="flex justify-between">
                          <Skeleton className="h-3 w-14" />
                          <Skeleton className="h-3 w-10" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-72" />
                <Skeleton className="mt-2 h-4 w-96" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-16" />
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
                Raporlar yüklenirken bir hata oluştu. Lütfen tekrar deneyin.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Danışman Raporları
                </h2>
                <p className="text-muted-foreground">
                  Danışman bazlı performans analizi ve istatistikleri
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-muted-foreground flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>Performans Analizi</span>
                </div>
                <AdvancedFilterDialog
                  onApplyFilters={handleApplyFilters}
                  initialFilters={activeFilters}
                  initialLogicalOperator={logicalOperator}
                  activeFilterCount={activeFilters.length}
                />
              </div>
            </div>

            {/* Özet Kartları */}
            {totalStats && averageStats && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Toplam Danışman
                    </CardTitle>
                    <Users className="text-muted-foreground h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {reportsData?.length || 0}
                    </div>
                    <p className="text-muted-foreground text-xs">
                      Aktif danışman sayısı
                    </p>
                    <div className="mt-1 text-sm font-medium text-blue-600">
                      {averageStats.avgContacts.toFixed(0)} ort. iletişim
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Toplam Satış
                    </CardTitle>
                    <Trophy className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {totalStats.sales.toLocaleString()}
                    </div>
                    <p className="text-muted-foreground text-xs">
                      Tüm danışmanların satışı
                    </p>
                    <div className="mt-1 text-sm font-medium text-green-600">
                      {averageStats.avgSales.toFixed(1)} ort. satış
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Ortalama Dönüşüm
                    </CardTitle>
                    <Target className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      %{averageStats.avgConversionRate.toFixed(2)}
                    </div>
                    <p className="text-muted-foreground text-xs">
                      İletişimden satışa dönüşüm
                    </p>
                    <div className="mt-1 text-sm font-medium text-blue-600">
                      Genel performans ortalaması
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      En İyi Danışman
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">
                      {topPerformers?.[0]?.name || '-'}
                    </div>
                    <p className="text-muted-foreground text-xs">
                      En çok satış yapan
                    </p>
                    <div className="mt-1 text-sm font-medium text-yellow-600">
                      {topPerformers?.[0]?.sales.total || 0} satış
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Top Performerlar */}
            {topPerformers && topPerformers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-600" />
                    En Başarılı Danışmanlar
                  </CardTitle>
                  <CardDescription>
                    Satış performansına göre ilk 3 danışman
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {topPerformers.map((performer, index) => {
                      const conversionRate =
                        performer.contacts.total > 0
                          ? (performer.sales.total / performer.contacts.total) *
                            100
                          : 0;

                      return (
                        <div
                          key={performer.name}
                          className={`rounded-lg border p-4 ${
                            index === 0
                              ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30'
                              : index === 1
                                ? 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/30'
                                : 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30'
                          }`}
                        >
                          <div className="mb-2 flex items-center gap-2">
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                                index === 0
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                                  : index === 1
                                    ? 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300'
                                    : 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300'
                              }`}
                            >
                              {index + 1}
                            </div>
                            <span className="font-semibold">
                              {performer.name}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Satış:</span>
                              <span className="font-medium text-green-600">
                                {performer.sales.total}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Dönüşüm:</span>
                              <span className="font-medium text-blue-600">
                                %{conversionRate.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>İletişim:</span>
                              <span className="font-medium">
                                {performer.contacts.total.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Detaylı Rapor Tablosu */}
            <Card>
              <CardHeader>
                <CardTitle>Detaylı Danışman Performans Raporu</CardTitle>
                <CardDescription>
                  Tüm danışmanların iletişim, teklif, satış ve iptal
                  istatistikleri
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reportsData && reportsData.length > 0 ? (
                  <ReportsTable data={reportsData} />
                ) : (
                  <div className="text-muted-foreground py-8 text-center">
                    Henüz rapor verisi bulunmuyor.
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
