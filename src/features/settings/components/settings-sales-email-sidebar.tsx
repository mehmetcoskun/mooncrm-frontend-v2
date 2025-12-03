import { useCallback, useEffect, useState } from 'react';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getSetting, updateOrCreateSetting } from '@/services/setting-service';
import { MailCheck } from 'lucide-react';
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

const DEFAULT_MESSAGE_TEMPLATE =
  'Hello, {name}!\n\nWelcome to {organization_name}! We are delighted to provide you with the confirmation of your appointment, accommodation, and transfer details. Thank you for choosing us!\n\nAppointment Details:\n\nDate: {appointment_date}\nService: {service_name}\n\nAccommodation Details:\n\nHotel Name: {hotel_name}\nCheck-in Date: {check_in}\nCheck-out Date: {check_out}\n\nUpon your arrival at the airport, our transfer team will warmly welcome you and take you to your designated hotel. This way, you can rest comfortably after your journey and gather energy before your service.\n\nAs the day of your appointment approaches, our excitement grows. We are eager to provide you with the best dental care! If you have any questions or additional requests, please feel free to contact us. We are here to assist you.\n\nWe look forward to hosting you soon and ensuring you leave with a beautiful smile.\n\nWith warm regards,\n\n{organization_name}';

const formSchema = z.object({
  status: z.boolean(),
  message_template: z.string().min(1, 'Mesaj şablonu gereklidir.'),
});
type SettingsSalesEmailForm = z.infer<typeof formSchema>;

interface SettingsSalesEmailSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsSalesEmailSidebar({
  open,
  onOpenChange,
}: SettingsSalesEmailSidebarProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const form = useForm<SettingsSalesEmailForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: true,
      message_template: DEFAULT_MESSAGE_TEMPLATE,
    },
  });

  const loadSettings = useCallback(async () => {
    try {
      setIsFetching(true);
      const settings = await getSetting();

      if (settings?.sales_mail_settings) {
        const salesMailSettings = settings.sales_mail_settings;

        form.reset({
          status: salesMailSettings.status ?? true,
          message_template:
            salesMailSettings.message_template || DEFAULT_MESSAGE_TEMPLATE,
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

  const onSubmit = async (values: SettingsSalesEmailForm) => {
    try {
      setIsLoading(true);

      const response = await updateOrCreateSetting({
        sales_mail_settings: {
          status: values.status,
          message_template: values.message_template,
        },
      });

      toast.success('Başarılı', {
        description:
          response?.message || 'Satış e-posta ayarları başarıyla kaydedildi.',
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
    <Sheet
      open={open}
      onOpenChange={(state) => {
        form.reset({
          status: true,
          message_template: DEFAULT_MESSAGE_TEMPLATE,
        });
        onOpenChange(state);
      }}
    >
      <SheetContent className="w-full overflow-y-auto p-4 sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <MailCheck className="h-5 w-5" />
            Satış E-Posta Ayarları
          </SheetTitle>
          <SheetDescription>
            Satış sürecine özel e-posta şablonları.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <Form {...form}>
            <form
              id="sales-email-settings-form"
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
                        Satış E-Posta Durumu
                      </FormLabel>
                      <FormDescription>
                        Satış e-postaları gönderilsin mi?
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
                name="message_template"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Mesaj Şablonu</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Mesaj şablonu"
                        className="h-96 font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <div className="text-muted-foreground space-y-1 text-xs">
                      <p className="font-medium">Kullanılabilir değişkenler:</p>
                      <p>
                        <code className="text-xs">{'{name}'}</code> - Müşteri
                        adı
                      </p>
                      <p>
                        <code className="text-xs">{'{organization_name}'}</code>{' '}
                        - Firma adı
                      </p>
                      <p>
                        <code className="text-xs">{'{appointment_date}'}</code>{' '}
                        - Randevu tarihi
                      </p>
                      <p>
                        <code className="text-xs">{'{service_name}'}</code> -
                        Hizmet adı
                      </p>
                      <p>
                        <code className="text-xs">{'{hotel_name}'}</code> - Otel
                        adı
                      </p>
                      <p>
                        <code className="text-xs">{'{check_in}'}</code> - Giriş
                        tarihi
                      </p>
                      <p>
                        <code className="text-xs">{'{check_out}'}</code> - Çıkış
                        tarihi
                      </p>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  form="sales-email-settings-form"
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
  );
}
