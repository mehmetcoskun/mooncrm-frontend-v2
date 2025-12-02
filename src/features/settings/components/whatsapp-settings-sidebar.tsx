import { useCallback, useEffect, useState } from 'react';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getSetting, updateOrCreateSetting } from '@/services/setting-service';
import { MessageCircle } from 'lucide-react';
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
  api_url: z.string().min(1, 'WhatsApp API URL gereklidir.'),
  api_key: z.string().min(1, 'WhatsApp API Anahtarı gereklidir.'),
  session_limit: z
    .string()
    .min(1, 'Oturum Limiti gereklidir.')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Oturum Limiti pozitif bir sayı olmalıdır.',
    }),
});
type WhatsappSettingsForm = z.infer<typeof formSchema>;

interface WhatsappSettingsSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WhatsappSettingsSidebar({
  open,
  onOpenChange,
}: WhatsappSettingsSidebarProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const form = useForm<WhatsappSettingsForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      api_url: '',
      api_key: '',
      session_limit: '4',
    },
  });

  const loadSettings = useCallback(async () => {
    try {
      setIsFetching(true);
      const settings = await getSetting();

      if (settings?.whatsapp_settings) {
        const whatsappSettings = settings.whatsapp_settings;

        form.reset({
          api_url: whatsappSettings.api_url,
          api_key: whatsappSettings.api_key,
          session_limit: String(whatsappSettings.session_limit),
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

  const onSubmit = async (values: WhatsappSettingsForm) => {
    try {
      setIsLoading(true);

      const response = await updateOrCreateSetting({
        whatsapp_settings: {
          api_url: values.api_url,
          api_key: values.api_key,
          session_limit: Number(values.session_limit),
        },
      });

      toast.success('Başarılı', {
        description:
          response?.message || 'WhatsApp ayarları başarıyla kaydedildi.',
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
          api_url: '',
          api_key: '',
          session_limit: '4',
        });
        onOpenChange(state);
      }}
    >
      <SheetContent className="w-full overflow-y-auto p-4 sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            WhatsApp Ayarları
          </SheetTitle>
          <SheetDescription>
            WhatsApp entegrasyon ve mesaj ayarlarını düzenleyin.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <Form {...form}>
            <form
              id="whatsapp-settings-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="api_url"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>WhatsApp API URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="WhatsApp API URL"
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
                name="api_key"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>WhatsApp API Anahtarı</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="WhatsApp API Anahtarı"
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
                name="session_limit"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Oturum Limiti</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Oturum Limiti"
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
                  form="whatsapp-settings-form"
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
