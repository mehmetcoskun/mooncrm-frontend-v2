import { useCallback, useEffect, useState } from 'react';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getSetting, updateOrCreateSetting } from '@/services/setting-service';
import { FileText, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { WhatsappChatSelector } from '@/components/whatsapp-chat-selector';

const DEFAULT_MESSAGE_TEMPLATE =
  '{user} - {date}\n\nGünlük Lead: {daily_leads}\nToplam Fotoğraf Gelmedi: {total_no_photos}\nToplam Teklif Bekliyor: {total_waiting_offer}\nGünlük Satış: {daily_sales}\nGünlük Teklif Geçilen: {daily_offered}\nGünlük Aranan Hasta: {daily_called_patients}\nOlumlu: {total_positive}\nBilet Beklenen: {total_waiting_ticket}';

const formSchema = z.object({
  status: z.boolean(),
  chat_id: z.string().min(1, 'Chat ID gereklidir.'),
  message_template: z.string().min(1, 'Mesaj şablonu gereklidir.'),
});
type DailyReportSettingsForm = z.infer<typeof formSchema>;

interface DailyReportSettingsSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DailyReportSettingsSidebar({
  open,
  onOpenChange,
}: DailyReportSettingsSidebarProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [chatSelectorOpen, setChatSelectorOpen] = useState(false);

  const form = useForm<DailyReportSettingsForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: true,
      chat_id: '',
      message_template: DEFAULT_MESSAGE_TEMPLATE,
    },
  });

  const loadSettings = useCallback(async () => {
    try {
      setIsFetching(true);
      const settings = await getSetting();

      if (settings?.daily_report_settings) {
        const reportSettings = settings.daily_report_settings;

        form.reset({
          status: reportSettings.status ?? true,
          chat_id: reportSettings.chat_id || '',
          message_template:
            reportSettings.message_template || DEFAULT_MESSAGE_TEMPLATE,
        });
      }
    } catch (error) {
      toast.error('Hata', {
        description:
          error instanceof AxiosError
            ? error.response?.data?.message
            : 'Ayarlar yüklenirken bir hata oluştu.',
      });
    } finally {
      setIsFetching(false);
    }
  }, [form]);

  useEffect(() => {
    if (open) {
      loadSettings();
    }
  }, [open, loadSettings]);

  const onSubmit = async (values: DailyReportSettingsForm) => {
    try {
      setIsLoading(true);

      const response = await updateOrCreateSetting({
        daily_report_settings: {
          status: values.status,
          chat_id: values.chat_id,
          message_template: values.message_template,
        },
      });

      toast.success('Başarılı', {
        description:
          response?.message || 'Günlük rapor ayarları başarıyla kaydedildi.',
      });

      onOpenChange(false);
    } catch (error) {
      toast.error('Hata', {
        description:
          error instanceof AxiosError
            ? error.response?.data?.message
            : 'Ayarlar kaydedilirken bir hata oluştu.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(state) => {
          form.reset({
            status: true,
            chat_id: '',
            message_template: DEFAULT_MESSAGE_TEMPLATE,
          });
          onOpenChange(state);
        }}
      >
        <SheetContent className="w-full overflow-y-auto p-4 sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Günlük Rapor Ayarları
            </SheetTitle>
            <SheetDescription>
              Günlük rapor formatı ve gönderim ayarları.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6">
            <Form {...form}>
              <form
                id="daily-report-settings-form"
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Günlük Rapor Durumu
                        </FormLabel>
                        <FormDescription>
                          Günlük rapor gönderilsin mi?
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="chat_id"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>WhatsApp Chat ID</FormLabel>
                      <FormControl>
                        <div className="flex w-full items-center gap-2">
                          <Input
                            placeholder="Chat ID"
                            autoComplete="off"
                            disabled
                            {...field}
                          />
                          <Button
                            variant="outline"
                            type="button"
                            onClick={() => setChatSelectorOpen(true)}
                          >
                            <Search className="size-4" />
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message_template"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Mesaj Şablonu</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Mesaj şablonu"
                          className="min-h-[200px] font-mono text-sm"
                          {...field}
                        />
                      </FormControl>
                      <div className="text-muted-foreground space-y-1 text-xs">
                        <p className="font-medium">
                          Kullanılabilir değişkenler:
                        </p>
                        <p>
                          <code className="text-xs">{'{user}'}</code> -
                          Danışmanın adı
                        </p>
                        <p>
                          <code className="text-xs">{'{date}'}</code> - Raporun
                          oluşturulduğu tarih
                        </p>
                        <p>
                          <code className="text-xs">{'{daily_leads}'}</code> - O
                          gün içinde oluşturulan yeni müşteri (lead) sayısı
                        </p>
                        <p>
                          <code className="text-xs">{'{total_no_photos}'}</code>{' '}
                          - Fotoğraf göndermeyen toplam müşteri sayısı
                        </p>
                        <p>
                          <code className="text-xs">
                            {'{total_waiting_offer}'}
                          </code>{' '}
                          - Teklif bekleyen toplam müşteri sayısı
                        </p>
                        <p>
                          <code className="text-xs">{'{daily_sales}'}</code> - O
                          gün içinde yapılan toplam satış sayısı
                        </p>
                        <p>
                          <code className="text-xs">{'{daily_offered}'}</code> -
                          O gün içinde teklif yapılmış müşteri sayısı
                        </p>
                        <p>
                          <code className="text-xs">
                            {'{daily_called_patients}'}
                          </code>{' '}
                          - O gün içinde aranmış toplam hasta sayısı
                        </p>
                        <p>
                          <code className="text-xs">{'{total_positive}'}</code>{' '}
                          - Olumlu sonuçlanan toplam müşteri sayısı
                        </p>
                        <p>
                          <code className="text-xs">
                            {'{total_waiting_ticket}'}
                          </code>{' '}
                          - Bilet bekleyen toplam müşteri sayısı
                        </p>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    form="daily-report-settings-form"
                    disabled={isLoading || isFetching}
                    className="flex-1"
                  >
                    {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </SheetContent>
      </Sheet>

      <WhatsappChatSelector
        open={chatSelectorOpen}
        onOpenChange={setChatSelectorOpen}
        onSelectChat={(chatId) => {
          form.setValue('chat_id', chatId);
        }}
      />
    </>
  );
}
