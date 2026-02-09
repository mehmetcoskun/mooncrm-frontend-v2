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
import { addDays, format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { type Organization } from '../data/schema';

const formSchema = z
  .object({
    name: z.string().min(1, 'Firma adı gereklidir.'),
    code: z.string().min(1, 'Firma kodu gereklidir.'),
    is_active: z.boolean(),
    trial_ends_at: z.string().nullable().optional(),
    license_ends_at: z.string().nullable().optional(),
    isEdit: z.boolean(),
  })
  .refine(
    (data) => !(data.trial_ends_at && data.license_ends_at),
    {
      message:
        'Deneme süresi ve lisans süresi aynı anda tanımlanamaz. Lütfen sadece birini seçin.',
      path: ['trial_ends_at'],
    }
  );
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

  const formatDateValue = (date: Date | string | null | undefined): string | null => {
    if (!date) return null;
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return null;
    return format(d, 'yyyy-MM-dd');
  };

  const form = useForm<OrganizationForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          name: currentRow.name,
          code: currentRow.code,
          is_active: currentRow.is_active ?? true,
          trial_ends_at: formatDateValue(currentRow.trial_ends_at),
          license_ends_at: formatDateValue(currentRow.license_ends_at),
          isEdit,
        }
      : {
          name: '',
          code: '',
          is_active: true,
          trial_ends_at: null,
          license_ends_at: null,
          isEdit,
        },
  });

  const trialEndsAt = form.watch('trial_ends_at');
  const licenseEndsAt = form.watch('license_ends_at');

  const setDateFromDays = (
    field: 'trial_ends_at' | 'license_ends_at',
    days: number
  ) => {
    const date = addDays(new Date(), days);
    form.setValue(field, format(date, 'yyyy-MM-dd'), {
      shouldValidate: true,
    });
  };

  const onSubmit = async (values: OrganizationForm) => {
    try {
      setIsLoading(true);

      const payload = {
        name: values.name,
        code: values.code,
        is_active: values.is_active,
        trial_ends_at: values.trial_ends_at || null,
        license_ends_at: values.license_ends_at || null,
      };

      if (isEdit && currentRow) {
        await updateOrganization(currentRow.id, payload);
        toast.success('Firma güncellendi', {
          description: `${values.name} firması başarıyla güncellendi.`,
        });
      } else {
        await createOrganization(payload);
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

  const renderDateField = (
    fieldName: 'trial_ends_at' | 'license_ends_at',
    label: string
  ) => {
    const otherField =
      fieldName === 'trial_ends_at' ? 'license_ends_at' : 'trial_ends_at';
    const otherValue = form.watch(otherField);

    return (
      <FormField
        control={form.control}
        name={fieldName}
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel>{label}</FormLabel>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Gün"
                min={1}
                disabled={!!otherValue}
                className="w-[20%] shrink-0"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = parseInt(
                      (e.target as HTMLInputElement).value,
                      10
                    );
                    if (val > 0) {
                      setDateFromDays(fieldName, val);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (val > 0) {
                    setDateFromDays(fieldName, val);
                  }
                }}
              />
              <div className="relative min-w-0 flex-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        disabled={!!otherValue}
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          field.value && 'pr-8',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                        <span className="truncate">
                          {field.value
                            ? format(new Date(field.value), 'dd MMMM yyyy', {
                                locale: tr,
                              })
                            : 'Tarih seçin'}
                        </span>
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        field.value ? new Date(field.value) : undefined
                      }
                      onSelect={(date) => {
                        if (date) {
                          field.onChange(format(date, 'yyyy-MM-dd'));
                        }
                      }}
                      disabled={(date) => date < new Date()}
                      locale={tr}
                    />
                  </PopoverContent>
                </Popover>
                {field.value && (
                  <button
                    type="button"
                    className="absolute top-1/2 right-2 -translate-y-1/2 rounded-sm opacity-70 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      form.setValue(fieldName, null, {
                        shouldValidate: true,
                      });
                    }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset();
        onOpenChange(state);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
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
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Firma Durumu</FormLabel>
                      <div className="text-muted-foreground text-sm">
                        Firmanın sisteme erişim durumu
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
              <div className="border-t pt-4">
                {trialEndsAt && licenseEndsAt && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>
                      Deneme süresi ve lisans süresi aynı anda tanımlanamaz.
                      Lütfen sadece birini seçin.
                    </AlertDescription>
                  </Alert>
                )}

                {renderDateField(
                  'license_ends_at',
                  'Lisans Bitiş Tarihi'
                )}
              </div>

              <div>
                {renderDateField(
                  'trial_ends_at',
                  'Deneme Süresi Bitiş Tarihi'
                )}
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
          <Button type="submit" form="organization-form" disabled={isLoading}>
            {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
