'use client';

import { useState } from 'react';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createDoctor, updateDoctor } from '@/services/doctor-service';
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
import { type Doctor } from '../data/schema';

const formSchema = z.object({
  name: z.string().min(1, 'Doktor adı gereklidir.'),
  isEdit: z.boolean(),
});
type DoctorForm = z.infer<typeof formSchema>;

type DoctorActionDialogProps = {
  currentRow?: Doctor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function DoctorsActionDialog({
  currentRow,
  open,
  onOpenChange,
  onSuccess,
}: DoctorActionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const isEdit = !!currentRow;
  const form = useForm<DoctorForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          name: currentRow.name,
          isEdit,
        }
      : {
          name: '',
          isEdit,
        },
  });

  const onSubmit = async (values: DoctorForm) => {
    try {
      setIsLoading(true);

      if (isEdit && currentRow) {
        await updateDoctor(currentRow.id, values);
        toast.success('Doktor güncellendi', {
          description: `${values.name} adlı doktor başarıyla güncellendi.`,
        });
      } else {
        await createDoctor(values);
        toast.success('Doktor eklendi', {
          description: `${values.name} adlı doktor başarıyla eklendi.`,
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
            {isEdit ? 'Doktor Düzenle' : 'Yeni Doktor Ekle'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Doktornu burada güncelleyin. '
              : 'Yeni doktoru burada oluşturun. '}
            İşlem tamamlandığında kaydet'e tıklayın.
          </DialogDescription>
        </DialogHeader>
        <div className="py-1">
          <Form {...form}>
            <form
              id="doctor-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 px-0.5"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Doktor Adı</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Doktor Adı"
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
          <Button type="submit" form="doctor-form" disabled={isLoading}>
            {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
