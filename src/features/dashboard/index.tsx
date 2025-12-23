import { useRef, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboard } from '@/services/dashboard-service';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import WorldMap from 'react-svg-worldmap';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { LeadSwitch } from '@/components/lead-switch';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { ThemeSwitch } from '@/components/theme-switch';
import { DashboardOverview } from './components/dashboard-overview';
import { DashboardUpcomingReminders } from './components/dashboard-upcoming-reminders';

export function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
  });

  const stats = data?.stats || {
    totalCustomers: 0,
    totalCustomersGrowth: 0,
    totalSales: 0,
    totalSalesGrowth: 0,
    totalProposals: 0,
    totalProposalsGrowth: 0,
    conversionRate: 0,
    conversionRateGrowth: 0,
  };

  const upcomingReminders = data?.upcomingReminders || [];
  const countryDistribution = data?.countryDistribution || [];

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapWidth, setMapWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      if (mapContainerRef.current) {
        setMapWidth(mapContainerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const chartData = data
    ? [
        'Ocak',
        'Şubat',
        'Mart',
        'Nisan',
        'Mayıs',
        'Haziran',
        'Temmuz',
        'Ağustos',
        'Eylül',
        'Ekim',
        'Kasım',
        'Aralık',
      ].map((name, index) => ({
        name,
        customers: data.monthlyCustomers[index] || 0,
        proposals: data.monthlyProposals[index] || 0,
        sales: data.monthlySales[index] || 0,
      }))
    : [];

  return (
    <>
      <Header fixed>
        <div className="ms-auto flex items-center space-x-4">
          <LeadSwitch />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fluid>
        <div className="mb-2 flex items-center justify-between space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Gösterge Paneli</h1>
        </div>
        <Tabs
          orientation="vertical"
          defaultValue="overview"
          className="space-y-4"
        >
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Toplam Müşteri
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="text-muted-foreground h-4 w-4"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? '-' : stats.totalCustomers.toLocaleString()}
                  </div>
                  <p className="text-muted-foreground flex items-center gap-1 text-xs">
                    {stats.totalCustomersGrowth >= 0 ? (
                      <ArrowUpIcon className="h-3 w-3 text-green-500" />
                    ) : (
                      <ArrowDownIcon className="h-3 w-3 text-red-500" />
                    )}
                    <span
                      className={
                        stats.totalCustomersGrowth >= 0
                          ? 'text-green-500'
                          : 'text-red-500'
                      }
                    >
                      {Math.abs(stats.totalCustomersGrowth)}%
                    </span>
                    <span>son 30 günden</span>
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Toplam Teklif
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="text-muted-foreground h-4 w-4"
                  >
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <path d="M2 10h20" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? '-' : stats.totalProposals.toLocaleString()}
                  </div>
                  <p className="text-muted-foreground flex items-center gap-1 text-xs">
                    {stats.totalProposalsGrowth >= 0 ? (
                      <ArrowUpIcon className="h-3 w-3 text-green-500" />
                    ) : (
                      <ArrowDownIcon className="h-3 w-3 text-red-500" />
                    )}
                    <span
                      className={
                        stats.totalProposalsGrowth >= 0
                          ? 'text-green-500'
                          : 'text-red-500'
                      }
                    >
                      {Math.abs(stats.totalProposalsGrowth)}%
                    </span>
                    <span>son 30 günden</span>
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Toplam Satış
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="text-muted-foreground h-4 w-4"
                  >
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? '-' : stats.totalSales.toLocaleString()}
                  </div>
                  <p className="text-muted-foreground flex items-center gap-1 text-xs">
                    {stats.totalSalesGrowth >= 0 ? (
                      <ArrowUpIcon className="h-3 w-3 text-green-500" />
                    ) : (
                      <ArrowDownIcon className="h-3 w-3 text-red-500" />
                    )}
                    <span
                      className={
                        stats.totalSalesGrowth >= 0
                          ? 'text-green-500'
                          : 'text-red-500'
                      }
                    >
                      {Math.abs(stats.totalSalesGrowth)}%
                    </span>
                    <span>son 30 günden</span>
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Dönüşüm Oranı
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="text-muted-foreground h-4 w-4"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? '-' : `${stats.conversionRate}%`}
                  </div>
                  <p className="text-muted-foreground flex items-center gap-1 text-xs">
                    {stats.conversionRateGrowth >= 0 ? (
                      <ArrowUpIcon className="h-3 w-3 text-green-500" />
                    ) : (
                      <ArrowDownIcon className="h-3 w-3 text-red-500" />
                    )}
                    <span
                      className={
                        stats.conversionRateGrowth >= 0
                          ? 'text-green-500'
                          : 'text-red-500'
                      }
                    >
                      {Math.abs(stats.conversionRateGrowth)}%
                    </span>
                    <span>son 30 günden</span>
                  </p>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Genel Bakış</CardTitle>
                <CardDescription>Son 12 aylık veriler</CardDescription>
              </CardHeader>
              <CardContent className="ps-2">
                {isLoading ? (
                  <div className="text-muted-foreground flex h-[350px] items-center justify-center">
                    Yükleniyor...
                  </div>
                ) : (
                  <DashboardOverview data={chartData} />
                )}
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Ülkelere Göre Müşteri Dağılımı</CardTitle>
                  <CardDescription>
                    Müşterilerinizin dünya genelindeki dağılımı
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div ref={mapContainerRef} className="w-full">
                    {isLoading ? (
                      <div className="text-muted-foreground flex h-[200px] items-center justify-center">
                        Yükleniyor...
                      </div>
                    ) : mapWidth > 0 ? (
                      <WorldMap
                        color="black"
                        size={mapWidth}
                        data={countryDistribution}
                        richInteraction
                      />
                    ) : null}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Yaklaşan Hatırlatıcılar</CardTitle>
                  <CardDescription>Yaklaşan hatırlatıcılarınız</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-muted-foreground flex h-[200px] items-center justify-center">
                      Yükleniyor...
                    </div>
                  ) : (
                    <DashboardUpcomingReminders
                      upcomingReminders={upcomingReminders}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </Main>
    </>
  );
}
