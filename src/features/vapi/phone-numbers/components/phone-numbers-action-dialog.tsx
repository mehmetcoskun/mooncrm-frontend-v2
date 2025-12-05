'use client';

import { useEffect, useState } from 'react';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createVapiPhoneNumber,
  updateVapiPhoneNumber,
  createVapiCredential,
} from '@/services/vapi-service';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Switch } from '@/components/ui/switch';
import { type PhoneNumber } from '../data/schema';

const formSchema = z.object({
  sipProviderName: z.string().min(1, 'SIP Sağlayıcı Adı gereklidir.'),
  sipServerAddress: z.string().optional(),
  sipUsername: z.string().optional(),
  sipPassword: z.string().optional(),
  phoneNumber: z.string().optional(),
  inboundEnabled: z.boolean(),
  isEdit: z.boolean(),
});
type PhoneNumberForm = z.infer<typeof formSchema>;

type PhoneNumberActionDialogProps = {
  currentRow?: PhoneNumber;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function PhoneNumbersActionDialog({
  currentRow,
  open,
  onOpenChange,
  onSuccess,
}: PhoneNumberActionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const isEdit = !!currentRow;
  const form = useForm<PhoneNumberForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          sipProviderName: currentRow.name || '',
          sipServerAddress: '',
          sipUsername: '',
          sipPassword: '',
          phoneNumber: currentRow.number || '',
          inboundEnabled: false,
          isEdit,
        }
      : {
          sipProviderName: '',
          sipServerAddress: '',
          sipUsername: '',
          sipPassword: '',
          phoneNumber: '',
          inboundEnabled: false,
          isEdit,
        },
  });

  useEffect(() => {
    if (open && currentRow) {
      form.reset({
        sipProviderName: currentRow.name || '',
        sipServerAddress: '',
        sipUsername: '',
        sipPassword: '',
        phoneNumber: currentRow.number || '',
        inboundEnabled: false,
        isEdit: true,
      });
    } else if (open && !currentRow) {
      form.reset({
        sipProviderName: '',
        sipServerAddress: '',
        sipUsername: '',
        sipPassword: '',
        phoneNumber: '',
        inboundEnabled: false,
        isEdit: false,
      });
    }
  }, [open, currentRow, form]);

  const onSubmit = async (values: PhoneNumberForm) => {
    try {
      setIsLoading(true);

      if (isEdit && currentRow) {
        const updateData = {
          name: values.sipProviderName,
        };
        await updateVapiPhoneNumber(currentRow.id, updateData);
        toast.success('Telefon Numarası güncellendi', {
          description: `${values.sipProviderName} başarıyla güncellendi.`,
        });
      } else {
        if (
          !values.sipServerAddress ||
          !values.sipUsername ||
          !values.sipPassword ||
          !values.phoneNumber
        ) {
          toast.error('Hata', {
            description: 'Lütfen tüm alanları doldurun.',
          });
          return;
        }

        const credentialData = {
          provider: 'byo-sip-trunk',
          name: values.sipProviderName,
          gateways: [
            {
              ip: values.sipServerAddress,
              inboundEnabled: values.inboundEnabled,
            },
          ],
          outboundLeadingPlusEnabled: true,
          outboundAuthenticationPlan: {
            authUsername: values.sipUsername,
            authPassword: values.sipPassword,
          },
        };

        const credential = await createVapiCredential(credentialData);

        const phoneNumberData = {
          provider: 'byo-phone-number',
          name: values.sipProviderName,
          number: values.phoneNumber,
          numberE164CheckEnabled: false,
          credentialId: credential.id,
        };

        await createVapiPhoneNumber(phoneNumberData);
        toast.success('Telefon Numarası eklendi', {
          description: `${values.sipProviderName} başarıyla eklendi.`,
        });
      }

      form.reset();
      onOpenChange(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error('Hata', {
        description: `İşlem sırasında bir hata oluştu: ${error instanceof AxiosError ? error.response?.data.message : 'Bilinmeyen hata'}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!isLoading) {
          form.reset();
          onOpenChange(state);
        }
      }}
    >
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-lg">
        <DialogHeader className="flex-shrink-0 text-start">
          <DialogTitle>
            {isEdit ? 'Telefon Numarası Düzenle' : 'Yeni Telefon Numarası Ekle'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Telefon numarasını burada güncelleyin. '
              : 'Yeni telefon numarasını burada oluşturun. '}
            İşlem tamamlandığında kaydet&apos;e tıklayın.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto py-1">
          <Form {...form}>
            <form
              id="phone-number-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 px-0.5"
            >
              <FormField
                control={form.control}
                name="sipProviderName"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>SIP Sağlayıcı Adı</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="SIP Sağlayıcı Adı"
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
                name="sipProviderName"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>SIP Sağlayıcı Adı</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="SIP Sağlayıcı Adı"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!isEdit && (
                <>
                  <FormField
                    control={form.control}
                    name="sipServerAddress"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>SIP Sunucu Adresi</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="örn: sip.example.com"
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
                    name="sipUsername"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>SIP Kullanıcı Adı</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="SIP Kullanıcı Adı"
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
                    name="sipPassword"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>SIP Şifresi</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="SIP Şifresi"
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
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Telefon Numarası</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="örn: +905551234567"
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
                    name="inboundEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Gelen Arama Etkin
                          </FormLabel>
                          <FormDescription>
                            Bu seçenek aktif edildiğinde telefon numarası gelen
                            aramaları alabilir.
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
                </>
              )}
            </form>
          </Form>
        </div>
        <DialogFooter className="flex-shrink-0 border-t pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            İptal
          </Button>
          <Button type="submit" form="phone-number-form" disabled={isLoading}>
            {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
