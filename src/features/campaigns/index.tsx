import { useCallback, useEffect, useState } from 'react';
import {
  checkEmailSchedulerStatus,
  stopEmailScheduler,
} from '@/services/mail-scheduler-service';
import {
  checkWhatsappSchedulerStatus,
  stopWhatsappScheduler,
} from '@/services/whatsapp-scheduler-service';
import {
  Search,
  Loader2,
  StopCircle,
  CheckCircle2,
  Clock,
  Users,
  Send,
  Trash2,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { LeadSwitch } from '@/components/lead-switch';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { ThemeSwitch } from '@/components/theme-switch';
import type { CampaignStatus, StoredCampaign } from './data/schema';

const STORAGE_KEYS = {
  whatsapp: 'whatsapp_campaign_keys',
  email: 'email_campaign_keys',
} as const;

type CampaignType = 'whatsapp' | 'email';

export function Campaigns() {
  const { hasPermission } = usePermissions();

  const hasWhatsappAccess = hasPermission('whatsapp_message_status_Access');
  const hasEmailAccess = hasPermission('email_message_status_Access');

  const getDefaultCampaignType = (): CampaignType => {
    if (hasWhatsappAccess) return 'whatsapp';
    if (hasEmailAccess) return 'email';
    return 'whatsapp';
  };

  const [campaignType, setCampaignType] = useState<CampaignType>(
    getDefaultCampaignType()
  );
  const [campaignKey, setCampaignKey] = useState('');
  const [campaignStatus, setCampaignStatus] = useState<CampaignStatus | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [storedKeys, setStoredKeys] = useState<StoredCampaign[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const storageKey = STORAGE_KEYS[campaignType];

  useEffect(() => {
    const keys = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const formattedKeys = keys.map((item: string | StoredCampaign) => {
      if (typeof item === 'string') {
        return {
          key: item,
          createdAt: new Date().toISOString(),
          totalCustomers: 0,
        };
      }
      return item;
    });
    const sortedKeys = formattedKeys.sort(
      (a: StoredCampaign, b: StoredCampaign) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setStoredKeys(sortedKeys);
    setSelectedKey(null);
    setCampaignStatus(null);
    setCampaignKey('');
  }, [campaignType, storageKey]);

  const checkStatus = useCallback(
    async (key: string) => {
      try {
        const statusResponse =
          campaignType === 'whatsapp'
            ? await checkWhatsappSchedulerStatus(key)
            : await checkEmailSchedulerStatus(key);

        const status = statusResponse.data || statusResponse;
        setCampaignStatus(status);

        if (status.status === 'completed' || status.status === 'stopped') {
          return false;
        }
        return true;
      } catch {
        toast.error('Durum kontrol edilirken bir hata oluştu.');
        return false;
      }
    },
    [campaignType]
  );

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    const startPolling = async () => {
      if (selectedKey) {
        const shouldContinue = await checkStatus(selectedKey);

        if (shouldContinue) {
          interval = setInterval(async () => {
            const shouldContinuePolling = await checkStatus(selectedKey);
            if (!shouldContinuePolling && interval) {
              clearInterval(interval);
              interval = null;
            }
          }, 5000);
        }
      }
    };

    startPolling();

    return () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };
  }, [selectedKey, checkStatus]);

  const handleKeyCheck = async () => {
    if (!campaignKey.trim()) return;
    setLoading(true);
    setSelectedKey(campaignKey);
    await checkStatus(campaignKey);
    setLoading(false);
  };

  const handleStop = async () => {
    if (!selectedKey) return;
    try {
      if (campaignType === 'whatsapp') {
        await stopWhatsappScheduler(selectedKey);
      } else {
        await stopEmailScheduler(selectedKey);
      }
      await checkStatus(selectedKey);
      toast.success('Kampanya başarıyla durduruldu.');
    } catch {
      toast.error('Kampanya durdurulurken bir hata oluştu.');
    }
  };

  const handleDelete = (
    campaignToDelete: StoredCampaign,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    const updatedKeys = storedKeys.filter(
      (campaign) => campaign.key !== campaignToDelete.key
    );
    localStorage.setItem(storageKey, JSON.stringify(updatedKeys));
    setStoredKeys(updatedKeys);

    if (selectedKey === campaignToDelete.key) {
      setSelectedKey(null);
      setCampaignStatus(null);
      setCampaignKey('');
    }

    toast.success('Kampanya listeden kaldırıldı.');
  };

  const formatTime = (seconds: number) => {
    if (!seconds || seconds < 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const calculateProgress = (sent: number, total: number) => {
    if (!total || !sent || total === 0) return 0;
    const progress = Math.round((sent / total) * 100);
    return Math.min(Math.max(progress, 0), 100);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusIcon = (status: CampaignStatus['status']) => {
    switch (status) {
      case 'in-progress':
        return <Loader2 className="h-5 w-5 animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'stopped':
        return <StopCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getStatusText = (status: CampaignStatus['status']) => {
    switch (status) {
      case 'in-progress':
        return 'Devam Ediyor';
      case 'completed':
        return 'Tamamlandı';
      case 'stopped':
        return 'Durduruldu';
      default:
        return 'Bilinmiyor';
    }
  };

  const getStatusDescription = (
    status: CampaignStatus['status'],
    remainingTime?: number
  ) => {
    switch (status) {
      case 'in-progress':
        return remainingTime
          ? `${formatTime(remainingTime)} kaldı`
          : 'Mesajlar gönderiliyor';
      case 'completed':
        return 'Tüm mesajlar gönderildi';
      case 'stopped':
        return 'Kampanya durduruldu';
      default:
        return '';
    }
  };

  const progress = campaignStatus
    ? calculateProgress(
        campaignStatus.sentCustomers,
        campaignStatus.totalCustomers
      )
    : 0;

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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Kampanya Durumu
            </h1>
            <p className="text-muted-foreground">
              Kampanya durumlarını takip edin
            </p>
          </div>
        </div>

        <div className="mb-4 flex gap-2">
          {hasWhatsappAccess && (
            <Button
              variant={campaignType === 'whatsapp' ? 'default' : 'outline'}
              onClick={() => setCampaignType('whatsapp')}
            >
              WhatsApp
            </Button>
          )}
          {hasEmailAccess && (
            <Button
              variant={campaignType === 'email' ? 'default' : 'outline'}
              onClick={() => setCampaignType('email')}
            >
              E-Posta
            </Button>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Kampanya Ara</CardTitle>
              <CardDescription>
                Kampanya anahtarını girerek durumu kontrol edin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    value={campaignKey}
                    onChange={(e) => setCampaignKey(e.target.value)}
                    placeholder="Kampanya anahtarını girin"
                    className="pl-9"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleKeyCheck();
                      }
                    }}
                  />
                </div>
                <Button
                  onClick={handleKeyCheck}
                  disabled={loading || !campaignKey.trim()}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Kontrol Et'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {campaignStatus && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Kampanya Detayları</CardTitle>
                    <CardDescription>Gerçek zamanlı takip</CardDescription>
                  </div>
                  {campaignStatus.status === 'in-progress' && (
                    <Button variant="destructive" onClick={handleStop}>
                      <StopCircle className="mr-2 h-4 w-4" />
                      Durdur
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/50 flex items-center gap-3 rounded-lg border p-4">
                  {getStatusIcon(campaignStatus.status)}
                  <div>
                    <p className="font-medium">
                      {getStatusText(campaignStatus.status)}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {getStatusDescription(
                        campaignStatus.status,
                        campaignStatus.remainingTime
                      )}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <Users className="text-muted-foreground h-5 w-5" />
                        <div>
                          <p className="text-muted-foreground text-sm">
                            Toplam Müşteri
                          </p>
                          <p className="text-2xl font-bold">
                            {campaignStatus.totalCustomers}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <Send className="text-muted-foreground h-5 w-5" />
                        <div>
                          <p className="text-muted-foreground text-sm">
                            Gönderilen
                          </p>
                          <p className="text-2xl font-bold">
                            {campaignStatus.sentCustomers}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <Clock className="text-muted-foreground h-5 w-5" />
                        <div>
                          <p className="text-muted-foreground text-sm">Kalan</p>
                          <p className="text-2xl font-bold">
                            {campaignStatus.remainingCustomers}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">İlerleme</span>
                    <span className="text-lg font-bold">{progress}%</span>
                  </div>
                  <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                    <div
                      className="bg-primary h-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-muted-foreground flex items-center justify-between text-sm">
                    <span>{campaignStatus.remainingCustomers} mesaj kaldı</span>
                    {campaignStatus.status === 'in-progress' &&
                      campaignStatus.remainingTime && (
                        <span>
                          {formatTime(campaignStatus.remainingTime)} kaldı
                        </span>
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!campaignStatus && (
            <Card>
              <CardContent className="flex min-h-[400px] flex-col items-center justify-center py-12">
                <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                  <Search className="text-muted-foreground h-8 w-8" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">
                  Kampanya Seçilmedi
                </h3>
                <p className="text-muted-foreground text-center">
                  Detayları görüntülemek için bir kampanya seçin veya anahtar
                  girin
                </p>
              </CardContent>
            </Card>
          )}

          {storedKeys.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Son Kampanyalar</CardTitle>
                <CardDescription>Geçmiş kampanyalarınız</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-[400px] space-y-2 overflow-y-auto">
                  {storedKeys.map((campaign) => (
                    <div
                      key={campaign.key}
                      className={`hover:bg-muted/50 flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors ${
                        selectedKey === campaign.key ? 'bg-muted' : ''
                      }`}
                      onClick={() => {
                        setCampaignKey(campaign.key);
                        setSelectedKey(campaign.key);
                        checkStatus(campaign.key);
                      }}
                    >
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <Calendar className="text-muted-foreground h-4 w-4" />
                          <span className="font-medium">
                            {formatDate(campaign.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="text-muted-foreground h-4 w-4" />
                          <span className="text-muted-foreground text-sm">
                            {campaign.totalCustomers} Müşteri
                          </span>
                          <span className="text-muted-foreground text-xs">
                            • {campaign.key}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDelete(campaign, e)}
                        className="ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </Main>
    </>
  );
}
