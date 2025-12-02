'use client';

import { useState } from 'react';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createService, updateService } from '@/services/service-service';
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
import { type Service } from '../data/schema';

const formSchema = z.object({
  title: z.string().min(1, 'Hizmet adı gereklidir.'),
  isEdit: z.boolean(),
});
type ServiceForm = z.infer<typeof formSchema>;

type ServiceActionDialogProps = {
  currentRow?: Service;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function ServicesActionDialog({
  currentRow,
  open,
  onOpenChange,
  onSuccess,
}: ServiceActionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const isEdit = !!currentRow;
  const form = useForm<ServiceForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          title: currentRow.title,
          isEdit,
        }
      : {
          title: '',
          isEdit,
        },
  });

  const onSubmit = async (values: ServiceForm) => {
    try {
      setIsLoading(true);

      if (isEdit && currentRow) {
        await updateService(currentRow.id, values);
        toast.success('Hizmet güncellendi', {
          description: `${values.title} hizmet başarıyla güncellendi.`,
        });
      } else {
        await createService(values);
        toast.success('Hizmet eklendi', {
          description: `${values.title} hizmet başarıyla eklendi.`,
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
            {isEdit ? 'Hizmet Düzenle' : 'Yeni Hizmet Ekle'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Hizmetini burada güncelleyin. '
              : 'Yeni hizmeti burada oluşturun. '}
            İşlem tamamlandığında kaydet'e tıklayın.
          </DialogDescription>
        </DialogHeader>
        <div className="py-1">
          <Form {...form}>
            <form
              id="service-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 px-0.5"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Hizmet Adı</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Hizmet Adı"
                        autoComplete="off"
                        {...field}
                      />
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
          <Button type="submit" form="service-form" disabled={isLoading}>
            {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
