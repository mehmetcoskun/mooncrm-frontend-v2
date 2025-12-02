import { useCallback, useEffect, useState } from 'react';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getSetting, updateOrCreateSetting } from '@/services/setting-service';
import { MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
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

const formSchema = z.object({
  account_sid: z.string().min(1, 'Account SID gereklidir.'),
  auth_token: z.string().min(1, 'Auth Token gereklidir.'),
  phone_number: z.string().min(1, 'Twilio Telefon Numarası gereklidir.'),
});
type SmsSettingsForm = z.infer<typeof formSchema>;

interface SmsSettingsSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SmsSettingsSidebar({
  open,
  onOpenChange,
}: SmsSettingsSidebarProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const form = useForm<SmsSettingsForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      account_sid: '',
      auth_token: '',
      phone_number: '',
    },
  });

  const loadSettings = useCallback(async () => {
    try {
      setIsFetching(true);
      const settings = await getSetting();

      if (settings?.sms_settings) {
        const smsSettings = settings.sms_settings;

        form.reset({
          account_sid: smsSettings.account_sid,
          auth_token: smsSettings.auth_token,
          phone_number: smsSettings.phone_number,
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

  const onSubmit = async (values: SmsSettingsForm) => {
    try {
      setIsLoading(true);

      const response = await updateOrCreateSetting({
        sms_settings: {
          account_sid: values.account_sid,
          auth_token: values.auth_token,
          phone_number: values.phone_number,
        },
      });

      toast.success('Başarılı', {
        description: response?.message || 'SMS ayarları başarıyla kaydedildi.',
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
          account_sid: '',
          auth_token: '',
          phone_number: '',
        });
        onOpenChange(state);
      }}
    >
      <SheetContent className="w-full overflow-y-auto p-4 sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            SMS Ayarları
          </SheetTitle>
          <SheetDescription>
            SMS entegrasyonu ve şablon ayarlarını yönetin.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <Form {...form}>
            <form
              id="sms-settings-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="account_sid"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Account SID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Account SID"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="auth_token"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Auth Token</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Twilio Telefon Numarası</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+1234567890"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  form="sms-settings-form"
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
