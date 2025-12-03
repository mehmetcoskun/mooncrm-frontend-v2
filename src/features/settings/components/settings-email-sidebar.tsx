import { useCallback, useEffect, useState } from 'react';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  getSetting,
  updateOrCreateSetting,
  verifyMail,
} from '@/services/setting-service';
import { Mail } from 'lucide-react';
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
  smtp_from_name: z.string().min(1, 'Gönderici adı gereklidir.'),
  smtp_host: z.string().min(1, 'SMTP sunucu gereklidir.'),
  smtp_port: z.string().min(1, 'SMTP port gereklidir.'),
  smtp_username: z.string().min(1, 'SMTP kullanıcı adı gereklidir.'),
  smtp_password: z.string().min(1, 'SMTP şifre gereklidir.'),
});
type SettingsEmailForm = z.infer<typeof formSchema>;

interface SettingsEmailSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsEmailSidebar({
  open,
  onOpenChange,
}: SettingsEmailSidebarProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const form = useForm<SettingsEmailForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      smtp_from_name: '',
      smtp_host: '',
      smtp_port: '',
      smtp_username: '',
      smtp_password: '',
    },
  });

  const loadSettings = useCallback(async () => {
    try {
      setIsFetching(true);
      const settings = await getSetting();

      if (settings?.mail_settings) {
        const mailSettings = settings.mail_settings;

        form.reset({
          smtp_from_name: mailSettings.smtp_from_name,
          smtp_host: mailSettings.smtp_host,
          smtp_port: mailSettings.smtp_port,
          smtp_username: mailSettings.smtp_username,
          smtp_password: mailSettings.smtp_password,
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
      setIsVerified(false);
    }
  }, [open, loadSettings]);

  useEffect(() => {
    const subscription = form.watch(() => {
      setIsVerified(false);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const onValidate = async () => {
    try {
      setIsValidating(true);

      const isValid = await form.trigger();
      if (!isValid) {
        toast.error('Hata', {
          description: 'Lütfen tüm alanları doldurun.',
        });
        return;
      }

      const values = form.getValues();
      const response = await verifyMail({
        smtp_host: values.smtp_host,
        smtp_port: values.smtp_port,
        smtp_username: values.smtp_username,
        smtp_password: values.smtp_password,
      });

      setIsVerified(true);
      toast.success('Başarılı', {
        description: response?.message || 'SMTP ayarları doğrulandı.',
      });
    } catch (error) {
      setIsVerified(false);
      toast.error('Hata', {
        description:
          error instanceof AxiosError
            ? error.response?.data?.message
            : 'Doğrulama sırasında bir hata oluştu.',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const onSubmit = async (values: SettingsEmailForm) => {
    try {
      setIsLoading(true);

      const response = await updateOrCreateSetting({
        mail_settings: {
          smtp_from_name: values.smtp_from_name,
          smtp_host: values.smtp_host,
          smtp_port: values.smtp_port,
          smtp_username: values.smtp_username,
          smtp_password: values.smtp_password,
        },
      });

      toast.success('Başarılı', {
        description:
          response?.message || 'E-posta ayarları başarıyla kaydedildi.',
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
          smtp_from_name: '',
          smtp_host: '',
          smtp_port: '',
          smtp_username: '',
          smtp_password: '',
        });
        onOpenChange(state);
      }}
    >
      <SheetContent className="w-full overflow-y-auto p-4 sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            E-Posta Ayarları
          </SheetTitle>
          <SheetDescription>
            E-posta sunucu ve şablon ayarlarını yapılandırın.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <Form {...form}>
            <form
              id="email-settings-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="smtp_from_name"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Gönderici Adı</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Gönderici Adı"
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
                name="smtp_host"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>SMTP Sunucu</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="smtp.example.com"
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
                name="smtp_port"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>SMTP Port</FormLabel>
                    <FormControl>
                      <Input placeholder="587" autoComplete="off" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="smtp_username"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>SMTP Kullanıcı Adı</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="kullanici@example.com"
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
                name="smtp_password"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>SMTP Şifre</FormLabel>
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

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onValidate}
                  disabled={isLoading || isValidating || isFetching}
                  className="flex-1"
                >
                  {isValidating ? 'Doğrulanıyor...' : 'Doğrula'}
                </Button>
                <Button
                  type="submit"
                  form="email-settings-form"
                  disabled={
                    !isVerified || isLoading || isValidating || isFetching
                  }
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
