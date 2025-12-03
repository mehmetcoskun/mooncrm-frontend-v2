import { useCallback, useEffect, useState } from 'react';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getSetting, updateOrCreateSetting } from '@/services/setting-service';
import { Search, ShoppingCart } from 'lucide-react';
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
  '🎉 Yeni Satış Bildirimi!\n\n👤 Müşteri: {name}\n📅 Lead Tarihi: {date}\n📋 Kategori: {category}\n🏥 Tedavi: {service}\n📅 Randevu Tarihi: {appointment_date}\n👨‍💼 Danışman: {user}';

const formSchema = z.object({
  status: z.boolean(),
  chat_id: z.string().min(1, 'Chat ID gereklidir.'),
  message_template: z.string().min(1, 'Mesaj şablonu gereklidir.'),
});
type SettingsSalesNotificationForm = z.infer<typeof formSchema>;

interface SettingsSalesNotificationSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsSalesNotificationSidebar({
  open,
  onOpenChange,
}: SettingsSalesNotificationSidebarProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [chatSelectorOpen, setChatSelectorOpen] = useState(false);

  const form = useForm<SettingsSalesNotificationForm>({
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

      if (settings?.sales_notification_settings) {
        const salesSettings = settings.sales_notification_settings;

        form.reset({
          status: salesSettings.status ?? true,
          chat_id: salesSettings.chat_id || '',
          message_template:
            salesSettings.message_template || DEFAULT_MESSAGE_TEMPLATE,
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

  const onSubmit = async (values: SettingsSalesNotificationForm) => {
    try {
      setIsLoading(true);

      const response = await updateOrCreateSetting({
        sales_notification_settings: {
          status: values.status,
          chat_id: values.chat_id,
          message_template: values.message_template,
        },
      });

      toast.success('Başarılı', {
        description:
          response?.message || 'Satış bildirim ayarları başarıyla kaydedildi.',
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
              <ShoppingCart className="h-5 w-5" />
              Satış Bildirim Ayarları
            </SheetTitle>
            <SheetDescription>
              Satış ile ilgili bildirimleri yapılandırın.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6">
            <Form {...form}>
              <form
                id="sales-notification-settings-form"
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
                          Satış Bildirim Durumu
                        </FormLabel>
                        <FormDescription>
                          Satış bildirimleri gönderilsin mi?
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
                          <code className="text-xs">{'{name}'}</code> - Müşteri
                          adı
                        </p>
                        <p>
                          <code className="text-xs">{'{date}'}</code> - Lead
                          tarihi
                        </p>
                        <p>
                          <code className="text-xs">{'{category}'}</code> -
                          Kategori
                        </p>
                        <p>
                          <code className="text-xs">{'{service}'}</code> -
                          Tedavi
                        </p>
                        <p>
                          <code className="text-xs">
                            {'{appointment_date}'}
                          </code>{' '}
                          - Randevu tarihi
                        </p>
                        <p>
                          <code className="text-xs">{'{user}'}</code> - Danışman
                          adı
                        </p>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    form="sales-notification-settings-form"
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
