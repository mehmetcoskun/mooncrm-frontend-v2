import { useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Calendar, AlertCircle, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useOrganizationStore } from '@/stores/organization-store';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { LeadSwitch } from '@/components/lead-switch';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { ThemeSwitch } from '@/components/theme-switch';
import { settings } from './data/settings';

export function Settings() {
  const [openSidebar, setOpenSidebar] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { hasPermission } = usePermissions();
  const { currentOrganization } = useOrganizationStore();
  const navigate = useNavigate();

  const filteredSettings = useMemo(() => {
    if (!searchQuery.trim()) return settings;

    const query = searchQuery.toLowerCase().trim();
    return settings.filter(
      (setting) =>
        setting.name.toLowerCase().includes(query) ||
        setting.desc.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleSettingClick = (
    setting: (typeof settings)[0],
    hasAccess: boolean
  ) => {
    if (!hasAccess) {
      toast.error('Yetkiniz Yok', {
        description: 'Bu işlem için yetkiniz yok.',
      });
      return;
    }

    if ('route' in setting && setting.route) {
      navigate({ to: setting.route });
    } else {
      setOpenSidebar(setting.name);
    }
  };

  const handleCloseSidebar = () => {
    setOpenSidebar(null);
  };

  const getLicenseInfo = () => {
    if (!currentOrganization) return null;

    const { trial_ends_at, license_ends_at } = currentOrganization;
    const now = new Date();

    if (trial_ends_at) {
      const trialDate = new Date(trial_ends_at);
      const daysLeft = Math.ceil(
        (trialDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        type: 'trial',
        date: trialDate,
        daysLeft,
        isExpired: daysLeft < 0,
        isExpiringSoon: daysLeft <= 7 && daysLeft >= 0,
      };
    }

    if (license_ends_at) {
      const licenseDate = new Date(license_ends_at);
      const daysLeft = Math.ceil(
        (licenseDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        type: 'license',
        date: licenseDate,
        daysLeft,
        isExpired: daysLeft < 0,
        isExpiringSoon: daysLeft <= 30 && daysLeft >= 0,
      };
    }

    return null;
  };

  const licenseInfo = getLicenseInfo();

  return (
    <>
      <Header>
        <div className="ms-auto flex items-center gap-4">
          <LeadSwitch />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fluid>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Ayarlar</h1>
            <p className="text-muted-foreground">
              Sistem ayarlarınızı buradan yönetebilirsiniz.
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Ayar ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Separator className="my-4 shadow-sm" />

        {licenseInfo && (
          <div className="bg-card mb-6 rounded-xl border p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">
                  {licenseInfo.type === 'trial'
                    ? 'Deneme Lisansı'
                    : 'Lisans Bilgisi'}
                </h3>
                <div className="text-muted-foreground flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {licenseInfo.date.toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                        licenseInfo.isExpired
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                          : licenseInfo.isExpiringSoon
                            ? licenseInfo.daysLeft <= 3
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      }`}
                    >
                      {licenseInfo.isExpired ? (
                        <>
                          <AlertCircle className="h-3.5 w-3.5" />
                          <span>Süresi Doldu</span>
                        </>
                      ) : (
                        <span>{licenseInfo.daysLeft} gün kaldı</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <TooltipProvider>
          <ul className="faded-bottom no-scrollbar grid gap-4 overflow-auto pt-4 pb-16 md:grid-cols-2 lg:grid-cols-3">
            {filteredSettings.length === 0 ? (
              <li className="col-span-full py-12 text-center">
                <Search className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <p className="text-muted-foreground text-lg">
                  "{searchQuery}" için sonuç bulunamadı
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Farklı bir arama terimi deneyin
                </p>
              </li>
            ) : null}
            {filteredSettings.map((setting) => {
              const hasAccess = hasPermission(setting.permission);
              const cardContent = (
                <li
                  key={setting.name}
                  className={`rounded-lg border p-4 transition-shadow ${
                    hasAccess
                      ? 'cursor-pointer hover:shadow-md'
                      : 'cursor-not-allowed opacity-50'
                  }`}
                  onClick={() => handleSettingClick(setting, hasAccess)}
                >
                  <div className="mb-8 flex items-center justify-between">
                    <div
                      className={`bg-muted flex size-10 items-center justify-center rounded-lg p-2`}
                    >
                      {setting.logo}
                    </div>
                    <Button variant="outline" size="sm" disabled={!hasAccess}>
                      {'route' in setting ? 'Aç' : 'Düzenle'}
                    </Button>
                  </div>
                  <div>
                    <h2 className="mb-1 font-semibold">{setting.name}</h2>
                    <p className="line-clamp-2 text-gray-500">{setting.desc}</p>
                  </div>
                </li>
              );

              if (!hasAccess) {
                return (
                  <Tooltip key={setting.name}>
                    <TooltipTrigger asChild>{cardContent}</TooltipTrigger>
                    <TooltipContent>
                      <p>Bu işlem için yetkiniz yok</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return cardContent;
            })}
          </ul>
        </TooltipProvider>
      </Main>

      {settings
        .filter((setting) => 'component' in setting && setting.component)
        .map((setting) => {
          const SettingComponent = setting.component!;
          return (
            <SettingComponent
              key={setting.name}
              open={openSidebar === setting.name}
              onOpenChange={(open) => {
                if (!open) handleCloseSidebar();
              }}
            />
          );
        })}
    </>
  );
}
