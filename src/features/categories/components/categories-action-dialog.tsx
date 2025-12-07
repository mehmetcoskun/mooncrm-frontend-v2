'use client';

import { useEffect, useState } from 'react';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import {
  createCategory,
  updateCategory,
  getCategories,
} from '@/services/category-service';
import { X } from 'lucide-react';
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
import { SelectDropdown } from '@/components/select-dropdown';
import { type Category } from '../data/schema';

const formSchema = z.object({
  title: z.string().min(1, 'Kategori adı gereklidir.'),
  parent_id: z.number().nullable(),
  channel: z.string().nullable(),
  lead_form_id: z.string().nullable(),
  is_global: z.boolean(),
  isEdit: z.boolean(),
});
type CategoryForm = z.infer<typeof formSchema>;

type CategoryActionDialogProps = {
  currentRow?: Category;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function CategoriesActionDialog({
  currentRow,
  open,
  onOpenChange,
  onSuccess,
}: CategoryActionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstCommunication, setIsFirstCommunication] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const isEdit = !!currentRow;
  const form = useForm<CategoryForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          title: currentRow.title,
          parent_id: currentRow.parent_id,
          channel: currentRow.channel,
          lead_form_id: currentRow.lead_form_id,
          is_global: currentRow.is_global,
          isEdit,
        }
      : {
          title: '',
          parent_id: null,
          channel: null,
          lead_form_id: null,
          is_global: false,
          isEdit,
        },
  });

  useEffect(() => {
    if (isEdit && currentRow) {
      setIsFirstCommunication(!!currentRow.channel);
    } else {
      setIsFirstCommunication(false);
    }
  }, [isEdit, currentRow, open]);

  const onSubmit = async (values: CategoryForm) => {
    try {
      setIsLoading(true);
      const payload = { ...values };

      if (!isFirstCommunication) {
        payload.channel = null;
      }

      if (!values.lead_form_id) {
        payload.lead_form_id = '';
      }

      if (isEdit && currentRow) {
        await updateCategory(currentRow.id, payload);
        toast.success('Kategori güncellendi', {
          description: `${values.title} kategori başarıyla güncellendi.`,
        });
      } else {
        await createCategory(payload);
        toast.success('Kategori eklendi', {
          description: `${values.title} kategori başarıyla eklendi.`,
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
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader className="text-start">
          <DialogTitle>
            {isEdit ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Kategorinı burada güncelleyin. '
              : 'Yeni kategorinı burada oluşturun. '}
            İşlem tamamlandığında kaydet'e tıklayın.
          </DialogDescription>
        </DialogHeader>
        <div className="py-1">
          <Form {...form}>
            <form
              id="category-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 px-0.5"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Kategori Adı</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Kategori Adı"
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
                name="parent_id"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Üst Kategori</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <SelectDropdown
                          defaultValue={field.value?.toString() || ''}
                          onValueChange={(value) => {
                            field.onChange(value ? parseInt(value, 10) : null);
                          }}
                          placeholder="Üst kategori seçin (opsiyonel)"
                          items={categories
                            .filter(
                              (cat: Category) =>
                                !isEdit || cat.id !== currentRow?.id
                            )
                            .map((cat: Category) => ({
                              value: String(cat.id),
                              label: cat.title,
                            }))}
                          isControlled={true}
                          className="w-full"
                        />
                      </FormControl>
                      {field.value && (
                        <button
                          type="button"
                          onClick={() => field.onChange(null)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-200"
                          aria-label="Üst kategoriyi kaldır"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="channel"
                render={() => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>İlk İletişim</FormLabel>
                      <div className="text-muted-foreground text-sm">
                        Bu kategori için iletişim tanımlayın
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={isFirstCommunication}
                        onCheckedChange={setIsFirstCommunication}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {isFirstCommunication && (
                <FormField
                  control={form.control}
                  name="channel"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Kanal</FormLabel>
                      <FormControl>
                        <SelectDropdown
                          defaultValue={field.value || ''}
                          onValueChange={(value) => {
                            field.onChange(value || null);
                          }}
                          placeholder="İletişim kanalı seçin"
                          items={[
                            { value: 'whatsapp', label: 'WhatsApp' },
                            { value: 'sms', label: 'SMS' },
                            { value: 'email', label: 'E-Posta' },
                            { value: 'phone', label: 'Telefon Araması' },
                          ]}
                          isControlled={true}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="lead_form_id"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Lead Form ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Lead Form ID"
                        autoComplete="off"
                        {...field}
                        value={field.value ?? ''}
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
                        Bu kategori global olarak kullanılsın mı?
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
          <Button type="submit" form="category-form" disabled={isLoading}>
            {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
