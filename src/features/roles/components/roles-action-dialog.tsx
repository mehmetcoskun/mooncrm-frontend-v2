'use client';

import { useState } from 'react';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { getAvailablePermissions } from '@/services/permission-service';
import { createRole, updateRole } from '@/services/role-service';
import { getStatuses } from '@/services/status-service';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { type Role } from '../data/schema';

const formSchema = z.object({
  title: z.string().min(1, { message: 'Rol adı gereklidir.' }),
  has_status_filter: z.boolean(),
  is_global: z.boolean(),
  statuses: z.array(z.number()).optional(),
  permissions: z.array(z.number()).optional(),
  isEdit: z.boolean(),
});
type RoleForm = z.infer<typeof formSchema>;

type RolesActionDialogProps = {
  currentRow?: Role;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function RolesActionDialog({
  currentRow,
  open,
  onOpenChange,
  onSuccess,
}: RolesActionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const { data: statuses = [] } = useQuery({
    queryKey: ['statuses'],
    queryFn: getStatuses,
  });

  const { data: permissions = [] } = useQuery({
    queryKey: ['available-permissions'],
    queryFn: getAvailablePermissions,
  });

  const isEdit = !!currentRow;
  const form = useForm<RoleForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          title: currentRow.title,
          has_status_filter: currentRow.has_status_filter,
          is_global: currentRow.is_global,
          statuses: currentRow.statuses?.map((s) => s.id) || [],
          permissions: currentRow.permissions?.map((p) => p.id) || [],
          isEdit,
        }
      : {
          title: '',
          has_status_filter: false,
          is_global: false,
          statuses: [],
          permissions: [],
          isEdit,
        },
  });

  const onSubmit = async (values: RoleForm) => {
    try {
      setIsLoading(true);

      const payload = {
        title: values.title,
        has_status_filter: values.has_status_filter,
        is_global: values.is_global,
        statuses:
          values.has_status_filter && values.statuses
            ? values.statuses.map((id) => ({ id }))
            : [],
        permissions: values.permissions
          ? values.permissions.map((id) => ({ id }))
          : [],
      };

      if (isEdit && currentRow) {
        await updateRole(currentRow.id, payload);
        toast.success('Rol güncellendi', {
          description: `${values.title} rolü başarıyla güncellendi.`,
        });
      } else {
        await createRole(payload);
        toast.success('Rol eklendi', {
          description: `${values.title} rolü başarıyla eklendi.`,
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

  // Permission'ları kategorilere göre grupla
  const groupPermissions = (
    permissions: { id: number; title: string; slug: string }[]
  ) => {
    const grouped = permissions.reduce(
      (
        acc: Record<
          string,
          {
            title: string;
            actions: Record<
              string,
              { id: number; title: string; slug: string }
            >;
          }
        >,
        perm
      ) => {
        const category = acc[perm.title] || { title: perm.title, actions: {} };

        const actionType = perm.slug.split('_').pop();
        if (actionType) {
          category.actions[actionType] = perm;
        }

        acc[perm.title] = category;
        return acc;
      },
      {}
    );

    return Object.values(grouped);
  };

  const groupedPermissions = groupPermissions(permissions);

  // Permission helper fonksiyonları
  const handleGlobalSelectAll = () => {
    const currentPermissions = form.getValues('permissions') || [];
    const allPermissionIds = permissions.map((p: { id: number }) => p.id);
    const allSelected = allPermissionIds.every((id: number) =>
      currentPermissions.includes(id)
    );

    if (allSelected) {
      form.setValue('permissions', []);
    } else {
      form.setValue('permissions', allPermissionIds);
    }
  };

  const handleCategorySelectAll = (category: {
    actions: Record<string, { id: number }>;
  }) => {
    const currentPermissions = form.getValues('permissions') || [];
    const categoryPermissionIds = Object.values(category.actions).map(
      (action) => action.id
    );
    const allCategorySelected = categoryPermissionIds.every((id: number) =>
      currentPermissions.includes(id)
    );

    if (allCategorySelected) {
      const updatedPermissions = currentPermissions.filter(
        (id: number) => !categoryPermissionIds.includes(id)
      );
      form.setValue('permissions', updatedPermissions);
    } else {
      const newPermissions = [...currentPermissions];
      categoryPermissionIds.forEach((id: number) => {
        if (!newPermissions.includes(id)) {
          newPermissions.push(id);
        }
      });
      form.setValue('permissions', newPermissions);
    }
  };

  const handlePermissionChange = (permissionId: number, checked: boolean) => {
    const currentPermissions = form.getValues('permissions') || [];
    if (checked) {
      form.setValue('permissions', [...currentPermissions, permissionId]);
    } else {
      form.setValue(
        'permissions',
        currentPermissions.filter((id: number) => id !== permissionId)
      );
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
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader className="text-start">
          <DialogTitle>{isEdit ? 'Rol Düzenle' : 'Yeni Rol Ekle'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Rolı burada güncelleyin. '
              : 'Yeni rol burada oluşturun. '}
            İşlem tamamlandığında kaydet'e tıklayın.
          </DialogDescription>
        </DialogHeader>
        <div className="py-1">
          <Form {...form}>
            <form
              id="role-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 px-0.5"
            >
              {/* Temel Bilgiler Bölümü */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Sol: Temel Bilgiler */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Başlık</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Admin, Moderatör, vb."
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
                          <FormLabel>Global Rol</FormLabel>
                          <div className="text-muted-foreground text-sm">
                            Tüm firmalarda geçerli
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
                    name="has_status_filter"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Durum Filtresi</FormLabel>
                          <div className="text-muted-foreground text-sm">
                            Sadece belirli durumları görsün
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              if (!checked) {
                                form.setValue('statuses', []);
                              }
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Sağ: Durum Seçimi */}
                <div>
                  {form.watch('has_status_filter') && (
                    <FormField
                      control={form.control}
                      name="statuses"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Erişilebilir Durumlar</FormLabel>
                          <FormControl>
                            <ScrollArea className="h-60 w-full rounded-md border p-3">
                              <div className="space-y-2">
                                {statuses.map(
                                  (status: {
                                    id: number;
                                    title: string;
                                    background_color: string;
                                  }) => (
                                    <div
                                      key={status.id}
                                      className="flex items-center space-x-2"
                                    >
                                      <Checkbox
                                        id={`status-${status.id}`}
                                        checked={
                                          field.value?.includes(status.id) ||
                                          false
                                        }
                                        onCheckedChange={(checked) => {
                                          const currentValues =
                                            field.value || [];
                                          if (checked) {
                                            field.onChange([
                                              ...currentValues,
                                              status.id,
                                            ]);
                                          } else {
                                            field.onChange(
                                              currentValues.filter(
                                                (id) => id !== status.id
                                              )
                                            );
                                          }
                                        }}
                                      />
                                      <label
                                        htmlFor={`status-${status.id}`}
                                        className="flex cursor-pointer items-center gap-2 text-sm font-medium"
                                      >
                                        <div
                                          className="h-3 w-3 rounded-full"
                                          style={{
                                            backgroundColor:
                                              status.background_color,
                                          }}
                                        />
                                        {status.title}
                                      </label>
                                    </div>
                                  )
                                )}
                              </div>
                            </ScrollArea>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>

              {/* Yetkiler Bölümü - Tam Genişlik */}
              <div className="border-t pt-6">
                <FormField
                  control={form.control}
                  name="permissions"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormLabel className="text-base font-medium">
                        Yetkiler
                      </FormLabel>

                      {/* Tümünü Seç */}
                      <div className="bg-muted/30 flex items-center justify-start rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="select-all-permissions"
                            checked={
                              permissions.length > 0 &&
                              permissions.every((p: { id: number }) =>
                                field.value?.includes(p.id)
                              )
                            }
                            onCheckedChange={() => handleGlobalSelectAll()}
                          />
                          <label
                            htmlFor="select-all-permissions"
                            className="cursor-pointer font-medium"
                          >
                            Tüm Yetkiler Seç/Kaldır
                          </label>
                        </div>
                      </div>

                      <FormControl>
                        <ScrollArea className="h-80 w-full rounded-lg border">
                          <div className="p-4">
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                              {groupedPermissions.map(
                                (category: {
                                  title: string;
                                  actions: Record<
                                    string,
                                    { id: number; title: string; slug: string }
                                  >;
                                }) => (
                                  <div
                                    key={category.title}
                                    className="bg-card rounded-lg border"
                                  >
                                    {/* Kategori Başlığı */}
                                    <div className="bg-muted/30 border-b p-3">
                                      <div className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`category-${category.title}`}
                                          checked={
                                            Object.values(category.actions)
                                              .length > 0 &&
                                            Object.values(
                                              category.actions
                                            ).every((action) =>
                                              field.value?.includes(action.id)
                                            )
                                          }
                                          onCheckedChange={() =>
                                            handleCategorySelectAll(category)
                                          }
                                        />
                                        <label
                                          htmlFor={`category-${category.title}`}
                                          className="cursor-pointer text-sm font-medium"
                                        >
                                          {category.title}
                                        </label>
                                      </div>
                                    </div>

                                    {/* Kategori Aksiyonları */}
                                    <div className="p-3">
                                      <div className="space-y-2">
                                        {Object.entries(category.actions).map(
                                          ([actionKey, action]) => (
                                            <div
                                              key={`${category.title}-${actionKey}`}
                                              className="flex items-center space-x-2"
                                            >
                                              <Checkbox
                                                id={`${category.title}-${actionKey}`}
                                                checked={
                                                  field.value?.includes(
                                                    action.id
                                                  ) || false
                                                }
                                                onCheckedChange={(checked) =>
                                                  handlePermissionChange(
                                                    action.id,
                                                    checked as boolean
                                                  )
                                                }
                                              />
                                              <label
                                                htmlFor={`${category.title}-${actionKey}`}
                                                className="hover:text-foreground cursor-pointer text-sm"
                                              >
                                                {actionKey}
                                              </label>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        </ScrollArea>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
          <Button type="submit" form="role-form" disabled={isLoading}>
            {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
