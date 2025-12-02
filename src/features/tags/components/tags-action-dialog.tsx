'use client';

import { useState } from 'react';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/services/category-service';
import { createTag, updateTag } from '@/services/tag-service';
import { getUsers } from '@/services/user-service';
import { languages } from 'countries-list';
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
import { Textarea } from '@/components/ui/textarea';
import MultiSelectDropdown from '@/components/multi-select-dropdown';
import { SelectDropdown } from '@/components/select-dropdown';
import { type Category } from '@/features/categories/data/schema';
import { type User } from '@/features/users/data/schema';
import { type Tag } from '../data/schema';

const formSchema = z.object({
  title: z.string().min(1, 'Etiket adı gereklidir.'),
  language: z.string().nullable(),
  welcome_message: z.string().nullable(),
  categories: z.array(z.number()),
  users: z.array(z.number()),
  isEdit: z.boolean(),
});
type TagForm = z.infer<typeof formSchema>;

type TagActionDialogProps = {
  currentRow?: Tag;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function TagsActionDialog({
  currentRow,
  open,
  onOpenChange,
  onSuccess,
}: TagActionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  // Sadece rolü 3 olan kullanıcıları filtrele
  const filteredUsers = users.filter((user: User) =>
    user.roles.some((role) => role.id === 3)
  );

  const languageOptions = Object.entries(languages).map(([code, lang]) => ({
    value: code,
    label: lang.name,
  }));

  const isEdit = !!currentRow;
  const form = useForm<TagForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          title: currentRow.title,
          language: currentRow.language,
          welcome_message: currentRow.welcome_message,
          categories:
            currentRow.categories?.map((cat: Category) => cat.id) || [],
          users: currentRow.users?.map((user: User) => user.id) || [],
          isEdit,
        }
      : {
          title: '',
          language: null,
          welcome_message: null,
          categories: [],
          users: [],
          isEdit,
        },
  });

  const onSubmit = async (values: TagForm) => {
    try {
      setIsLoading(true);

      const formattedCategories = Array.isArray(values.categories)
        ? values.categories
            .filter((id) => id !== null && id !== undefined)
            .map((id) => ({ id }))
        : [];

      const formattedUsers = Array.isArray(values.users)
        ? values.users
            .filter((id) => id !== null && id !== undefined)
            .map((id) => ({ id }))
        : [];

      const payload = {
        ...values,
        categories: formattedCategories,
        users: formattedUsers,
      };

      if (isEdit && currentRow) {
        await updateTag(currentRow.id, payload);
        toast.success('Etiket güncellendi', {
          description: `${values.title} etiket başarıyla güncellendi.`,
        });
      } else {
        await createTag(payload);
        toast.success('Etiket eklendi', {
          description: `${values.title} etiket başarıyla eklendi.`,
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
            {isEdit ? 'Etiket Düzenle' : 'Yeni Etiket Ekle'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Etiketinizi burada güncelleyin. '
              : 'Yeni etiketinizi burada oluşturun. '}
            İşlem tamamlandığında kaydet'e tıklayın.
          </DialogDescription>
        </DialogHeader>
        <div className="py-1">
          <Form {...form}>
            <form
              id="tag-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 px-0.5"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Etiket Adı</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Etiket Adı"
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
                name="categories"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Kategoriler</FormLabel>
                    <FormControl>
                      <MultiSelectDropdown
                        value={field.value.map((categoryId) => {
                          const category = categories.find(
                            (c: Category) => c.id === categoryId
                          );
                          return {
                            value: categoryId.toString(),
                            label: category
                              ? category.title
                              : `Kategori #${categoryId}`,
                          };
                        })}
                        onChange={(selectedOptions) => {
                          field.onChange(
                            selectedOptions.map((option) =>
                              parseInt(option.value, 10)
                            )
                          );
                        }}
                        placeholder="Kategori seçiniz"
                        defaultOptions={categories.map(
                          (category: Category) => ({
                            value: category.id.toString(),
                            label: category.title,
                          })
                        )}
                        className="w-full"
                        hideClearAllButton
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="users"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Kullanıcılar</FormLabel>
                    <FormControl>
                      <MultiSelectDropdown
                        value={field.value.map((userId) => {
                          const user = filteredUsers.find(
                            (u: User) => u.id === userId
                          );
                          return {
                            value: userId.toString(),
                            label: user ? user.name : `Kullanıcı #${userId}`,
                          };
                        })}
                        onChange={(selectedOptions) => {
                          field.onChange(
                            selectedOptions.map((option) =>
                              parseInt(option.value, 10)
                            )
                          );
                        }}
                        placeholder="Kullanıcı seçiniz"
                        defaultOptions={filteredUsers.map((user: User) => ({
                          value: user.id.toString(),
                          label: user.name,
                        }))}
                        className="w-full"
                        hideClearAllButton
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Dil</FormLabel>
                    <FormControl>
                      <SelectDropdown
                        defaultValue={field.value ?? ''}
                        onValueChange={(value) => {
                          field.onChange(value || null);
                        }}
                        placeholder="Dil seçin"
                        items={languageOptions}
                        isControlled={true}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="welcome_message"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Karşılama Mesajı</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Karşılama Mesajı"
                        {...field}
                        value={field.value ?? ''}
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
          <Button type="submit" form="tag-form" disabled={isLoading}>
            {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
