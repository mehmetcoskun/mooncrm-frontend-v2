'use client';

import { useState } from 'react';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createWhatsappSession,
  updateWhatsappSession,
} from '@/services/whatsapp-session-service';
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
import { type WhatsappSession } from '../data/schema';

const formSchema = z.object({
  title: z.string().min(1, 'WhatsApp oturumu adı gereklidir.'),
  isEdit: z.boolean(),
});
type WhatsappSessionForm = z.infer<typeof formSchema>;

type WhatsappSessionsActionDialogProps = {
  currentRow?: WhatsappSession;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function WhatsappSessionsActionDialog({
  currentRow,
  open,
  onOpenChange,
  onSuccess,
}: WhatsappSessionsActionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const isEdit = !!currentRow;
  const form = useForm<WhatsappSessionForm>({
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

  const onSubmit = async (values: WhatsappSessionForm) => {
    try {
      setIsLoading(true);

      if (isEdit && currentRow) {
        await updateWhatsappSession(currentRow.id, values);
        toast.success('WhatsApp oturumu güncellendi', {
          description: `${values.title} WhatsApp oturumu başarıyla güncellendi.`,
        });
      } else {
        await createWhatsappSession(values);
        toast.success('WhatsApp oturumu eklendi', {
          description: `${values.title} WhatsApp oturumu başarıyla eklendi.`,
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
            {isEdit ? 'WhatsApp Oturumu Düzenle' : 'Yeni WhatsApp Oturumu Ekle'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'WhatsApp oturumunu burada güncelleyin. '
              : 'Yeni WhatsApp oturumunu burada oluşturun. '}
            İşlem tamamlandığında kaydet'e tıklayın.
          </DialogDescription>
        </DialogHeader>
        <div className="py-1">
          <Form {...form}>
            <form
              id="whatsapp-session-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 px-0.5"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>WhatsApp Oturumu Adı</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="WhatsApp Oturumu Adı"
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
          <Button
            type="submit"
            form="whatsapp-session-form"
            disabled={isLoading}
          >
            {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
