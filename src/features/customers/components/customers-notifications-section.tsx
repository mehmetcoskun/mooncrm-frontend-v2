import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import {
  Send,
  Mail,
  MessageSquare,
  Hotel,
  Bus,
  ShoppingCart,
  UserCheck,
  Users,
  RefreshCw,
  CheckCircle2,
  XCircle,
  History,
  Clock,
  ChevronRight,
  Inbox,
  PartyPopper,
  Ban,
  FileText,
} from 'lucide-react';
import {
  getCustomerNotifications,
  triggerCustomerNotification,
  type CustomerNotificationLog,
  type CustomerNotificationType,
} from '@/services/customer-service';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type Channel = 'whatsapp' | 'email' | 'sms' | 'phone';

interface NotificationDef {
  type: CustomerNotificationType;
  variant?: 'reservation' | 'cancel';
  label: string;
  description: string;
  channel: Channel;
  icon: React.ReactNode;
}

interface NotificationGroup {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  show: (statusId: number | null | undefined) => boolean;
  items: NotificationDef[];
}

const GROUPS: NotificationGroup[] = [
  {
    id: 'lead',
    title: 'Yeni Müşteri Akışı',
    description:
      'Müşteri kaydolduğunda otomatik tetiklenen, ekibi ve müşteriyi bilgilendiren bildirimler.',
    icon: <Inbox className="h-4 w-4" />,
    show: () => true,
    items: [
      {
        type: 'user_notification',
        label: 'Danışman Bildirimi',
        description: 'Atanan danışmanın WhatsApp\'ına yeni müşteri bildirimi.',
        channel: 'whatsapp',
        icon: <UserCheck className="h-4 w-4" />,
      },
      {
        type: 'group_notification',
        label: 'Lead Grubu Bildirimi',
        description: 'Yeni lead WhatsApp grubuna bildirim gönderir.',
        channel: 'whatsapp',
        icon: <Users className="h-4 w-4" />,
      },
      {
        type: 'customer_message',
        label: 'Müşteri Karşılama',
        description: 'Kategori kanalına göre WhatsApp / SMS / E-posta / Arama.',
        channel: 'whatsapp',
        icon: <MessageSquare className="h-4 w-4" />,
      },
    ],
  },
  {
    id: 'sale',
    title: 'Satış Akışı',
    description: 'Müşteri satışa dönüştüğünde tetiklenen rezervasyon bildirimleri.',
    icon: <PartyPopper className="h-4 w-4" />,
    show: (statusId) => statusId === 8,
    items: [
      {
        type: 'sales_notification',
        label: 'Satış Grubu Bildirimi',
        description: 'Satış WhatsApp grubuna satış bildirimi gönderir.',
        channel: 'whatsapp',
        icon: <ShoppingCart className="h-4 w-4" />,
      },
      {
        type: 'confirmation_email',
        label: 'Müşteri Onay E-postası',
        description: 'Müşteriye randevu/konaklama onay e-postası.',
        channel: 'email',
        icon: <Mail className="h-4 w-4" />,
      },
      {
        type: 'hotel_message',
        variant: 'reservation',
        label: 'Otel WhatsApp',
        description: 'Otele rezervasyon bildirimi (WhatsApp).',
        channel: 'whatsapp',
        icon: <Hotel className="h-4 w-4" />,
      },
      {
        type: 'hotel_email',
        variant: 'reservation',
        label: 'Otel E-posta',
        description: 'Otele rezervasyon bildirimi (e-posta).',
        channel: 'email',
        icon: <Hotel className="h-4 w-4" />,
      },
      {
        type: 'transfer_message',
        variant: 'reservation',
        label: 'Transfer WhatsApp',
        description: 'Transfer firmasına rezervasyon bildirimi.',
        channel: 'whatsapp',
        icon: <Bus className="h-4 w-4" />,
      },
    ],
  },
  {
    id: 'cancel',
    title: 'İptal Akışı',
    description: 'Müşteri iptal durumuna geçtiğinde tedarikçilere giden iptal bildirimleri.',
    icon: <Ban className="h-4 w-4" />,
    show: (statusId) => statusId === 9,
    items: [
      {
        type: 'hotel_message',
        variant: 'cancel',
        label: 'Otel WhatsApp İptal',
        description: 'Otele iptal bildirimi (WhatsApp).',
        channel: 'whatsapp',
        icon: <Hotel className="h-4 w-4" />,
      },
      {
        type: 'hotel_email',
        variant: 'cancel',
        label: 'Otel E-posta İptal',
        description: 'Otele iptal bildirimi (e-posta).',
        channel: 'email',
        icon: <Hotel className="h-4 w-4" />,
      },
      {
        type: 'transfer_message',
        variant: 'cancel',
        label: 'Transfer İptal WhatsApp',
        description: 'Transfer firmasına iptal bildirimi.',
        channel: 'whatsapp',
        icon: <Bus className="h-4 w-4" />,
      },
    ],
  },
];

const TYPE_LABELS: Record<CustomerNotificationType, string> = {
  user_notification: 'Danışman Bildirimi',
  group_notification: 'Lead Grubu Bildirimi',
  sales_notification: 'Satış Grubu Bildirimi',
  customer_message: 'Müşteri Karşılama',
  confirmation_email: 'Müşteri Onay E-postası',
  hotel_message: 'Otel WhatsApp',
  hotel_email: 'Otel E-posta',
  transfer_message: 'Transfer WhatsApp',
};

const CHANNEL_STYLES: Record<
  Channel,
  { bg: string; text: string; ring: string }
> = {
  whatsapp: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    ring: 'ring-emerald-500/20',
  },
  email: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
    ring: 'ring-blue-500/20',
  },
  sms: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    ring: 'ring-amber-500/20',
  },
  phone: {
    bg: 'bg-violet-500/10',
    text: 'text-violet-600 dark:text-violet-400',
    ring: 'ring-violet-500/20',
  },
};

interface Props {
  customerId: number;
  customerStatusId: number | null | undefined;
}

export function CustomersNotificationsSection({
  customerId,
  customerStatusId,
}: Props) {
  const queryClient = useQueryClient();
  const { isSuperUser, hasRole } = usePermissions();
  const isDeveloper = isSuperUser() || hasRole(1);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<
    'all' | 'success' | 'failed' | 'skipped'
  >('all');

  const visibleGroups = useMemo(
    () => GROUPS.filter((g) => g.show(customerStatusId)),
    [customerStatusId]
  );

  const {
    data: logsData,
    isLoading: isLogsLoading,
    isFetching: isLogsFetching,
    refetch: refetchLogs,
  } = useQuery({
    queryKey: ['customer-notifications', customerId],
    queryFn: () => getCustomerNotifications(customerId),
  });

  const logs = logsData?.data ?? [];

  const { lastByExact, lastByType } = useMemo(() => {
    const exact = new Map<string, CustomerNotificationLog>();
    const byType = new Map<string, CustomerNotificationLog>();
    for (const log of logs) {
      const key = `${log.type}::${log.variant ?? ''}`;
      if (!exact.has(key)) exact.set(key, log);
      if (!byType.has(log.type)) byType.set(log.type, log);
    }
    return { lastByExact: exact, lastByType: byType };
  }, [logs]);

  const triggerMutation = useMutation({
    mutationFn: ({
      type,
      variant,
    }: {
      type: CustomerNotificationType;
      variant?: 'reservation' | 'cancel';
    }) => triggerCustomerNotification(customerId, type, variant),
    onSuccess: (data) => {
      const status = data.notification?.status;
      if (status === 'success') {
        toast.success('Bildirim gönderildi.');
      } else if (status === 'skipped') {
        toast.warning('Bildirim atlandı', {
          description:
            data.notification?.skip_reason ??
            'Koşullar sağlanmadığı için bildirim gönderilmedi.',
        });
      } else if (status === 'failed') {
        toast.error('Bildirim başarısız', {
          description:
            data.notification?.error ??
            data.notification?.response_body ??
            'Bilinmeyen hata.',
        });
      } else {
        toast.success(data.message ?? 'Bildirim tetiklendi.');
      }
      queryClient.invalidateQueries({
        queryKey: ['customer-notifications', customerId],
      });
    },
    onError: (error: AxiosError<{ message?: string; error?: string }>) => {
      const msg =
        error.response?.data?.message ??
        error.response?.data?.error ??
        error.message;
      toast.error('Bildirim tetiklenemedi', { description: msg });
    },
  });

  const filteredLogs = useMemo(() => {
    if (historyFilter === 'all') return logs;
    return logs.filter((l) => l.status === historyFilter);
  }, [logs, historyFilter]);

  const counts = useMemo(() => {
    return {
      total: logs.length,
      success: logs.filter((l) => l.status === 'success').length,
      failed: logs.filter((l) => l.status === 'failed').length,
      skipped: logs.filter((l) => l.status === 'skipped').length,
    };
  }, [logs]);

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">Bildirimler</h3>
            <p className="text-muted-foreground text-sm">
              Bu müşteri için bildirimleri elle tetikle. İlk başarılı
              gönderimden sonra otomatik tetikleyici tekrar göndermez —
              gerekirse butonla zorla.
            </p>
          </div>

          <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <History className="h-4 w-4" />
                Geçmiş
                {counts.total > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {counts.total}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl md:max-w-2xl"
            >
              <SheetHeader className="border-b px-6 py-4">
                <SheetTitle>Bildirim Geçmişi</SheetTitle>
                <SheetDescription>
                  Bu müşteri için yapılmış tüm bildirim denemelerinin kaydı.
                  {!isDeveloper && (
                    <span className="text-muted-foreground mt-1 block text-xs">
                      Detaylı içerik (request / response) yalnızca developer
                      rolünde görünür.
                    </span>
                  )}
                </SheetDescription>
              </SheetHeader>

              <div className="flex items-center justify-between gap-2 border-b px-6 py-3">
                <Tabs
                  value={historyFilter}
                  onValueChange={(v) =>
                    setHistoryFilter(v as typeof historyFilter)
                  }
                >
                  <TabsList>
                    <TabsTrigger value="all" className="text-xs">
                      Hepsi {counts.total > 0 && `(${counts.total})`}
                    </TabsTrigger>
                    <TabsTrigger value="success" className="text-xs">
                      Başarılı {counts.success > 0 && `(${counts.success})`}
                    </TabsTrigger>
                    <TabsTrigger value="failed" className="text-xs">
                      Başarısız {counts.failed > 0 && `(${counts.failed})`}
                    </TabsTrigger>
                    <TabsTrigger value="skipped" className="text-xs">
                      Atlandı {counts.skipped > 0 && `(${counts.skipped})`}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => refetchLogs()}
                  disabled={isLogsFetching}
                >
                  <RefreshCw
                    className={cn(
                      'h-4 w-4',
                      isLogsFetching && 'animate-spin'
                    )}
                  />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                {isLogsLoading ? (
                  <div className="text-muted-foreground py-12 text-center text-sm">
                    Yükleniyor…
                  </div>
                ) : filteredLogs.length === 0 ? (
                  <div className="text-muted-foreground rounded-lg border border-dashed py-12 text-center text-sm">
                    Bu filtrede kayıt yok.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredLogs.map((log) => (
                      <NotificationLogItem
                        key={log.id}
                        log={log}
                        showDetails={isDeveloper}
                      />
                    ))}
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {visibleGroups.map((group) => (
          <section key={group.id} className="space-y-3">
            <div className="flex items-baseline gap-2">
              <div className="bg-muted text-muted-foreground rounded-md p-1.5">
                {group.icon}
              </div>
              <div>
                <h4 className="text-base font-semibold">{group.title}</h4>
                <p className="text-muted-foreground text-xs">
                  {group.description}
                </p>
              </div>
            </div>
            <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
              {group.items.map((item) => {
                const key = `${item.type}::${item.variant ?? ''}`;
                const last = item.variant
                  ? lastByExact.get(key)
                  : (lastByExact.get(key) ?? lastByType.get(item.type));
                const isPending =
                  triggerMutation.isPending &&
                  triggerMutation.variables?.type === item.type &&
                  triggerMutation.variables?.variant === item.variant;
                return (
                  <NotificationCard
                    key={key}
                    item={item}
                    last={last}
                    isPending={isPending}
                    onSend={() =>
                      triggerMutation.mutate({
                        type: item.type,
                        variant: item.variant,
                      })
                    }
                    onShowHistory={() => {
                      setHistoryOpen(true);
                    }}
                  />
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </TooltipProvider>
  );
}

interface NotificationCardProps {
  item: NotificationDef;
  last: CustomerNotificationLog | undefined;
  isPending: boolean;
  onSend: () => void;
  onShowHistory: () => void;
}

function NotificationCard({
  item,
  last,
  isPending,
  onSend,
  onShowHistory,
}: NotificationCardProps) {
  const cs = CHANNEL_STYLES[item.channel];
  const status = last?.status;

  return (
    <div className="group bg-card hover:border-primary/40 relative flex flex-col gap-3 overflow-hidden rounded-xl border p-4 transition-colors">
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full opacity-50 blur-2xl transition-opacity group-hover:opacity-80',
          cs.bg
        )}
      />

      <div className="relative flex items-start gap-3">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg ring-1',
            cs.bg,
            cs.text,
            cs.ring
          )}
        >
          {item.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="text-sm font-semibold">{item.label}</p>
            {item.variant && (
              <Badge variant="outline" className="text-[10px] uppercase">
                {item.variant === 'reservation' ? 'Rezervasyon' : 'İptal'}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs leading-snug">
            {item.description}
          </p>
        </div>
      </div>

      <div className="relative flex items-center justify-between gap-2 pt-1">
        <button
          type="button"
          onClick={onShowHistory}
          className="text-muted-foreground hover:text-foreground flex min-w-0 flex-1 items-center gap-1.5 text-xs transition-colors"
        >
          <StatusDot status={status} />
          <span className="truncate">
            {last ? (
              <>
                <span className="font-medium">
                  {statusLabel(status)}
                </span>
                <span className="text-muted-foreground/70 ml-1">
                  · {relativeTime(last.created_at)}
                </span>
              </>
            ) : (
              'Henüz gönderilmedi'
            )}
          </span>
          <ChevronRight className="h-3 w-3 shrink-0 opacity-50" />
        </button>

        <Button
          size="sm"
          onClick={onSend}
          disabled={isPending}
          variant={status === 'success' ? 'outline' : 'default'}
        >
          {isPending ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              Gönderiliyor
            </>
          ) : status === 'success' ? (
            <>
              <RefreshCw className="h-3.5 w-3.5" />
              Tekrar Gönder
            </>
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              Gönder
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function StatusDot({
  status,
}: {
  status: CustomerNotificationLog['status'] | undefined;
}) {
  const cls =
    status === 'success'
      ? 'bg-emerald-500'
      : status === 'failed'
        ? 'bg-red-500'
        : status === 'skipped'
          ? 'bg-amber-500'
          : 'bg-muted-foreground/40';
  return (
    <span
      className={cn(
        'inline-block h-2 w-2 shrink-0 rounded-full',
        cls,
        status === 'success' && 'ring-2 ring-emerald-500/20'
      )}
    />
  );
}

function statusLabel(status: CustomerNotificationLog['status'] | undefined) {
  switch (status) {
    case 'success':
      return 'Başarılı';
    case 'failed':
      return 'Başarısız';
    case 'skipped':
      return 'Atlandı';
    default:
      return 'Bilinmiyor';
  }
}

function relativeTime(iso: string): string {
  const d = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - d);
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'az önce';
  if (min < 60) return `${min} dk önce`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} saat önce`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} gün önce`;
  return new Date(iso).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function NotificationLogItem({
  log,
  showDetails,
}: {
  log: CustomerNotificationLog;
  showDetails: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const StatusIcon =
    log.status === 'success'
      ? CheckCircle2
      : log.status === 'failed'
        ? XCircle
        : Clock;
  const statusColor =
    log.status === 'success'
      ? 'text-emerald-500'
      : log.status === 'failed'
        ? 'text-red-500'
        : 'text-amber-500';

  return (
    <div className="bg-card overflow-hidden rounded-lg border">
      <button
        type="button"
        className="hover:bg-muted/50 flex w-full items-start justify-between gap-3 p-3 text-left transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex min-w-0 items-start gap-2.5">
          <StatusIcon
            className={cn('mt-0.5 h-4 w-4 shrink-0', statusColor)}
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="truncate text-sm font-medium">
                {TYPE_LABELS[log.type] ?? log.type}
              </p>
              {log.variant && (
                <Badge variant="outline" className="text-[10px] uppercase">
                  {log.variant === 'reservation' ? 'Rezervasyon' : log.variant}
                </Badge>
              )}
              <Badge
                variant="secondary"
                className={cn(
                  'text-[10px]',
                  log.triggered_by === 'manual' &&
                    'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                )}
              >
                {log.triggered_by === 'manual' ? 'Elle' : 'Otomatik'}
              </Badge>
              {log.response_status != null && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="text-[10px]">
                      {log.response_status}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="top">HTTP yanıt kodu</TooltipContent>
                </Tooltip>
              )}
            </div>
            <p className="text-muted-foreground mt-0.5 truncate text-xs">
              {log.skip_reason ??
                log.error ??
                (log.channel ? `${log.channel}` : '') +
                  (log.triggered_by_user?.name
                    ? ` · ${log.triggered_by_user.name}`
                    : '')}
            </p>
          </div>
        </div>
        <div className="text-muted-foreground shrink-0 text-right text-xs">
          {new Date(log.created_at).toLocaleString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </button>

      {expanded && (
        <div className="bg-muted/30 space-y-3 border-t p-3 text-xs">
          {log.skip_reason && (
            <DetailBlock label="Atlama Nedeni" content={log.skip_reason} />
          )}
          {log.error && <DetailBlock label="Hata" content={log.error} mono />}
          {showDetails ? (
            <>
              {log.request && (
                <DetailBlock
                  label="Request"
                  content={JSON.stringify(log.request, null, 2)}
                  mono
                />
              )}
              {log.response_body && (
                <DetailBlock
                  label="Response Body"
                  content={tryPrettyJson(log.response_body)}
                  mono
                />
              )}
            </>
          ) : (
            <div className="text-muted-foreground flex items-center gap-1.5 italic">
              <FileText className="h-3 w-3" />
              Detaylı içerik (request / response) sadece developer rolünde
              görünür.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DetailBlock({
  label,
  content,
  mono = false,
}: {
  label: string;
  content: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-muted-foreground mb-1 text-[10px] font-semibold tracking-wider uppercase">
        {label}
      </p>
      {mono ? (
        <pre className="bg-background overflow-x-auto rounded border p-2 text-[11px] leading-relaxed">
          {content}
        </pre>
      ) : (
        <p className="bg-background rounded border p-2">{content}</p>
      )}
    </div>
  );
}

function tryPrettyJson(s: string): string {
  try {
    return JSON.stringify(JSON.parse(s), null, 2);
  } catch {
    return s;
  }
}
