import { useCallback, useEffect, useState } from 'react';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getSetting, updateOrCreateSetting } from '@/services/setting-service';
import { Phone } from 'lucide-react';
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
  api_key: z.string().min(1, 'API Key gereklidir.'),
});
type SettingsVapiForm = z.infer<typeof formSchema>;

interface SettingsVapiSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsVapiSidebar({
  open,
  onOpenChange,
}: SettingsVapiSidebarProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const form = useForm<SettingsVapiForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      api_key: '',
    },
  });

  const loadSettings = useCallback(async () => {
    try {
      setIsFetching(true);
      const settings = await getSetting();

      if (settings?.vapi_settings) {
        const vapiSettings = settings.vapi_settings;

        form.reset({
          api_key: vapiSettings.api_key || '',
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

  const onSubmit = async (values: SettingsVapiForm) => {
    try {
      setIsLoading(true);

      const response = await updateOrCreateSetting({
        vapi_settings: {
          api_key: values.api_key,
        },
      });

      toast.success('Başarılı', {
        description:
          response?.message || 'VAPI AI ayarları başarıyla kaydedildi.',
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
          api_key: '',
        });
        onOpenChange(state);
      }}
    >
      <SheetContent className="w-full overflow-y-auto p-4 sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            VAPI AI Ayarları
          </SheetTitle>
          <SheetDescription>
            VAPI AI entegrasyonu için API anahtarınızı girin.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <Form {...form}>
            <form
              id="vapi-settings-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="api_key"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="API Key giriniz"
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
                  form="vapi-settings-form"
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
