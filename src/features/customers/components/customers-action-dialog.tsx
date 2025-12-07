'use client';

import { useEffect, useState } from 'react';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/services/category-service';
import { createCustomer } from '@/services/customer-service';
import { getServices } from '@/services/service-service';
import { getStatuses } from '@/services/status-service';
import { getUsers } from '@/services/user-service';
import { countries } from 'countries-list';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
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
import { MultiSelect } from '@/components/multi-select';
import { SelectDropdown } from '@/components/select-dropdown';

const formSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().min(1, 'Telefon numarası gereklidir.'),
  country: z.string().min(1, 'Ülke seçimi gereklidir.'),
  user_id: z.number().min(1, 'Danışman seçimi gereklidir.'),
  category_id: z.number().min(1, 'Kategori seçimi gereklidir.'),
  service_ids: z.array(z.number()).optional(),
  status_id: z.number().optional(),
  isEdit: z.boolean(),
});
type CustomerForm = z.infer<typeof formSchema>;

type CustomersActionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function CustomersActionDialog({
  open,
  onOpenChange,
  onSuccess,
}: CustomersActionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [phone, setPhone] = useState('');

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    enabled: open,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    enabled: open,
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: getServices,
    enabled: open,
  });

  const { data: statuses = [] } = useQuery({
    queryKey: ['statuses'],
    queryFn: getStatuses,
    enabled: open,
  });

  const form = useForm<CustomerForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      country: '',
      user_id: 0,
      category_id: 0,
      service_ids: [],
      status_id: 0,
      isEdit: false,
    },
  });

  useEffect(() => {
    if (open) {
      setPhone('');
    }
  }, [open]);

  const onSubmit = async (values: CustomerForm) => {
    try {
      setIsLoading(true);

      await createCustomer({
        ...values,
        phone,
      });
      toast.success('Müşteri eklendi', {
        description: `${values.name} adlı müşteri başarıyla eklendi.`,
      });

      form.reset();
      setPhone('');
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

  const countryOptions = Object.entries(countries).map(([code, country]) => ({
    label: country.name,
    value: code,
  }));

  const userOptions = users
    .filter((user: { id: number; name: string; roles: { id: number }[] }) =>
      user.roles.some((role) => role.id === 3)
    )
    .map((user: { id: number; name: string }) => ({
      label: user.name,
      value: String(user.id),
    }));

  const categoryOptions = categories.map(
    (cat: { id: number; title: string }) => ({
      label: cat.title,
      value: String(cat.id),
    })
  );

  const serviceOptions = services.map(
    (service: { id: number; title: string }) => ({
      label: service.title,
      value: String(service.id),
    })
  );

  const statusOptions = statuses.map(
    (status: { id: number; title: string }) => ({
      label: status.title,
      value: String(status.id),
    })
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset();
        setPhone('');
        onOpenChange(state);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle>Yeni Müşteri Ekle</DialogTitle>
          <DialogDescription>
            Yeni müşteriyi burada oluşturun. İşlem tamamlandığında kaydet'e
            tıklayın.
          </DialogDescription>
        </DialogHeader>
        <div className="py-1">
          <Form {...form}>
            <form
              id="customer-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 px-0.5"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Ad Soyad</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ad Soyad"
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
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>E-Posta</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="ornek@email.com"
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
                name="phone"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Telefon</FormLabel>
                    <FormControl>
                      <PhoneInput
                        defaultCountry="tr"
                        value={phone}
                        onChange={(phoneValue) => {
                          setPhone(phoneValue);
                          field.onChange(phoneValue);
                        }}
                        inputClassName="w-full"
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Ülke</FormLabel>
                    <FormControl>
                      <SelectDropdown
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder="Ülke seçin"
                        items={countryOptions}
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
                name="user_id"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Danışman</FormLabel>
                    <FormControl>
                      <SelectDropdown
                        defaultValue={String(field.value || '')}
                        onValueChange={(value) => field.onChange(Number(value))}
                        placeholder="Danışman seçin"
                        items={userOptions}
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
                name="category_id"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Kategori</FormLabel>
                    <FormControl>
                      <SelectDropdown
                        defaultValue={String(field.value || '')}
                        onValueChange={(value) => field.onChange(Number(value))}
                        placeholder="Kategori seçin"
                        items={categoryOptions}
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
                name="service_ids"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Hizmetler</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={serviceOptions}
                        defaultValue={(field.value ?? []).map(String)}
                        onValueChange={(values) =>
                          field.onChange(values.map(Number))
                        }
                        placeholder="Hizmet seçin"
                        maxCount={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status_id"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Durum</FormLabel>
                    <FormControl>
                      <SelectDropdown
                        defaultValue={String(field.value || '')}
                        onValueChange={(value) => field.onChange(Number(value))}
                        placeholder="Durum seçin"
                        items={statusOptions}
                        isControlled={true}
                        className="w-full"
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
          <Button type="submit" form="customer-form" disabled={isLoading}>
            {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
