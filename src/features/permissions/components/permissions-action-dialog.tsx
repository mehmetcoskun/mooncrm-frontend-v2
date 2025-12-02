'use client';

import { useState } from 'react';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createPermission,
  updatePermission,
} from '@/services/permission-service';
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
import { type Permission } from '../data/schema';

const formSchema = z.object({
  title: z.string().min(1, 'İzin adı gereklidir.'),
  slug: z.string().min(1, 'Slug gereklidir.'),
  is_custom: z.boolean(),
  is_global: z.boolean(),
  isEdit: z.boolean(),
});
type PermissionForm = z.infer<typeof formSchema>;

type PermissionActionDialogProps = {
  currentRow?: Permission;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function PermissionsActionDialog({
  currentRow,
  open,
  onOpenChange,
  onSuccess,
}: PermissionActionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const isEdit = !!currentRow;
  const form = useForm<PermissionForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          title: currentRow.title,
          slug: currentRow.slug,
          is_custom: currentRow.is_custom,
          is_global: currentRow.is_global,
          isEdit,
        }
      : {
          title: '',
          slug: '',
          is_custom: true,
          is_global: false,
          isEdit,
        },
  });

  const onSubmit = async (values: PermissionForm) => {
    try {
      setIsLoading(true);

      if (isEdit && currentRow) {
        await updatePermission(currentRow.id, values);
        toast.success('İzin güncellendi', {
          description: `${values.title} izni başarıyla güncellendi.`,
        });
      } else {
        await createPermission(values);
        toast.success('İzin eklendi', {
          description: `${values.title} izni başarıyla eklendi.`,
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

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
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
            {isEdit ? 'İzin Düzenle' : 'Yeni İzin Ekle'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'İzinı burada güncelleyin. '
              : 'Yeni izni burada oluşturun. '}
            İşlem tamamlandığında kaydet'e tıklayın.
          </DialogDescription>
        </DialogHeader>
        <div className="py-1">
          <Form {...form}>
            <form
              id="permission-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 px-0.5"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Başlık</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Kullanıcı Oluştur"
                        autoComplete="off"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          if (!isEdit) {
                            const slug = generateSlug(e.target.value);
                            form.setValue('slug', slug);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="user_create"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      İzin sistemi tarafından kullanılacak benzersiz tanımlayıcı
                    </FormDescription>
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
                      <FormLabel>Global İzin</FormLabel>
                      <div className="text-muted-foreground text-sm">
                        Tüm organizasyonlar için geçerli olacak sistem izni
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

              <FormField
                control={form.control}
                name="is_custom"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Özel İzin</FormLabel>
                      <div className="text-muted-foreground text-sm">
                        Kullanıcı tarafından oluşturulan özel izin
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
          <Button type="submit" form="permission-form" disabled={isLoading}>
            {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
