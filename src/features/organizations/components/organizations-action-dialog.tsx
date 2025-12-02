'use client';

import { useState } from 'react';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createOrganization,
  updateOrganization,
} from '@/services/organization-service';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { type Organization } from '../data/schema';

const formSchema = z.object({
  name: z.string().min(1, 'Firma adı gereklidir.'),
  code: z.string().min(1, 'Firma kodu gereklidir.'),
  logo: z.instanceof(File).optional(),
  removeLogo: z.boolean().optional(),
  isEdit: z.boolean(),
});
type OrganizationForm = z.infer<typeof formSchema>;

type OrganizationActionDialogProps = {
  currentRow?: Organization;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function OrganizationsActionDialog({
  currentRow,
  open,
  onOpenChange,
  onSuccess,
}: OrganizationActionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const isEdit = !!currentRow;
  const form = useForm<OrganizationForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          name: currentRow.name,
          code: currentRow.code,
          isEdit,
        }
      : {
          name: '',
          code: '',
          isEdit,
        },
  });

  const onSubmit = async (values: OrganizationForm) => {
    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('code', values.code);

      if (values.logo) {
        formData.append('logo', values.logo);
      }

      if (values.removeLogo) {
        formData.append('remove_logo', 'true');
      }

      if (isEdit && currentRow) {
        await updateOrganization(currentRow.id, formData);
        toast.success('Firma güncellendi', {
          description: `${values.name} firması başarıyla güncellendi.`,
        });
      } else {
        await createOrganization(formData);
        toast.success('Firma eklendi', {
          description: `${values.name} firması başarıyla eklendi.`,
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
        form.reset();
        onOpenChange(state);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle>
            {isEdit ? 'Firma Düzenle' : 'Yeni Firma Ekle'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Firmanı burada güncelleyin. '
              : 'Yeni firmayı burada oluşturun. '}
            İşlem tamamlandığında kaydet'e tıklayın.
          </DialogDescription>
        </DialogHeader>
        <div className="py-1">
          <Form {...form}>
            <form
              id="organization-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 px-0.5"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Firma Adı</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="MoonCRM"
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
                name="code"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Firma Kodu</FormLabel>
                    <FormControl>
                      <Input placeholder="xxxx" autoComplete="off" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="logo"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Logo</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        {/* Mevcut logo gösterimi */}
                        {isEdit &&
                          currentRow?.logo &&
                          !form.watch('removeLogo') && (
                            <div className="flex items-center space-x-2">
                              <img
                                src={`${import.meta.env.VITE_STORAGE_URL}/${currentRow.logo}`}
                                alt="Current logo"
                                className="h-12 w-12 rounded border object-contain"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  form.setValue('removeLogo', true)
                                }
                                className="text-destructive text-sm hover:underline"
                              >
                                Logoyu Kaldır
                              </button>
                            </div>
                          )}

                        {/* Logo kaldırılacaksa bilgi */}
                        {form.watch('removeLogo') && (
                          <div className="flex items-center space-x-2">
                            <span className="text-muted-foreground text-sm">
                              Logo kaldırılacak
                            </span>
                            <button
                              type="button"
                              onClick={() => form.setValue('removeLogo', false)}
                              className="text-primary text-sm hover:underline"
                            >
                              Geri Al
                            </button>
                          </div>
                        )}

                        {/* Logo upload input */}
                        {(!isEdit ||
                          !currentRow?.logo ||
                          form.watch('removeLogo')) && (
                          <Input
                            type="file"
                            accept="image/jpeg,image/png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                onChange(file);
                                // Logo kaldırma flagını sıfırla
                                if (form.watch('removeLogo')) {
                                  form.setValue('removeLogo', false);
                                }
                              }
                            }}
                            {...field}
                          />
                        )}

                        <p className="text-muted-foreground text-xs">
                          JPEG, PNG formatları desteklenir. Maksimum 10MB.
                        </p>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            İptal
          </Button>
          <Button type="submit" form="organization-form" disabled={isLoading}>
            {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
