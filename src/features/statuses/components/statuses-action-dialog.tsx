'use client';

import { useState } from 'react';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createStatus, updateStatus } from '@/services/status-service';
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
import { Switch } from '@/components/ui/switch';
import { type Status } from '../data/schema';

const formSchema = z.object({
  title: z.string().min(1, 'Durum adı gereklidir.'),
  background_color: z.string().min(1, 'Renk gereklidir.'),
  is_global: z.boolean(),
  isEdit: z.boolean(),
});
type StatusForm = z.infer<typeof formSchema>;

type StatusActionDialogProps = {
  currentRow?: Status;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function StatusesActionDialog({
  currentRow,
  open,
  onOpenChange,
  onSuccess,
}: StatusActionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const isEdit = !!currentRow;
  const form = useForm<StatusForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          title: currentRow.title,
          background_color: currentRow.background_color,
          is_global: currentRow.is_global,
          isEdit,
        }
      : {
          title: '',
          background_color: '',
          is_global: false,
          isEdit,
        },
  });

  const onSubmit = async (values: StatusForm) => {
    try {
      setIsLoading(true);

      if (isEdit && currentRow) {
        await updateStatus(currentRow.id, values);
        toast.success('Durum güncellendi', {
          description: `${values.title} durum başarıyla güncellendi.`,
        });
      } else {
        await createStatus(values);
        toast.success('Durum eklendi', {
          description: `${values.title} durum başarıyla eklendi.`,
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
            {isEdit ? 'Durum Düzenle' : 'Yeni Durum Ekle'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Durumunu burada güncelleyin. '
              : 'Yeni durumu burada oluşturun. '}
            İşlem tamamlandığında kaydet'e tıklayın.
          </DialogDescription>
        </DialogHeader>
        <div className="py-1">
          <Form {...form}>
            <form
              id="status-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 px-0.5"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Durum Adı</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Durum Adı"
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
                name="background_color"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Renk</FormLabel>
                    <FormControl>
                      <Input
                        type="color"
                        placeholder="Renk"
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
                name="is_global"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Global</FormLabel>
                      <div className="text-muted-foreground text-sm">
                        Bu durum global olarak kullanılsın mı?
                      </div>
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
          <Button type="submit" form="status-form" disabled={isLoading}>
            {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
