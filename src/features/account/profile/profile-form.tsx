import { useEffect } from 'react';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateUser } from '@/services/user-service';
import { languages } from 'countries-list';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import MultiSelectDropdown from '@/components/multi-select-dropdown';
import { PasswordInput } from '@/components/password-input';

const profileFormSchema = z.object({
  name: z.string().min(1, 'Kullanıcı adı gereklidir.'),
  email: z.email({
    error: (iss) =>
      iss.input === undefined ? 'E-Posta adresi gereklidir.' : undefined,
  }),
  password: z
    .string()
    .min(6, { message: 'Şifre en az 6 karakter olmalıdır.' })
    .optional()
    .or(z.literal('')),
  languages: z.array(z.string()),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileForm() {
  const { user } = useAuth();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      languages: [],
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || '',
        email: user.email || '',
        password: '',
        languages: user.languages || [],
      });
    }
  }, [user, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      const { password, ...dataToSend } = values;
      const payload = password && password.trim() !== '' ? values : dataToSend;

      await updateUser(Number(user?.id), payload);
      toast.success('Kullanıcı güncellendi', {
        description: `${values.name} başarıyla güncellendi.`,
      });
    } catch (error) {
      toast.error('Hata', {
        description: `İşlem sırasında bir hata oluştu: ${error instanceof AxiosError ? error.response?.data.message : 'Bilinmeyen hata'}`,
      });
    }
  };

  const languageOptions = Object.entries(languages).map(([code, lang]) => ({
    value: code,
    label: lang.name,
  }));

  const getLanguageName = (code: string): string => {
    return languages[code as keyof typeof languages]?.name || code;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ad Soyad</FormLabel>
              <FormControl>
                <Input placeholder="Ad Soyad" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-Posta</FormLabel>
              <FormControl>
                <Input placeholder="E-Posta" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Şifre</FormLabel>
              <FormControl>
                <PasswordInput placeholder="e.g., S3cur3P@ssw0rd" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="languages"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Diller</FormLabel>
              <FormControl>
                <MultiSelectDropdown
                  value={
                    field.value?.map((lang) => ({
                      value: lang,
                      label: getLanguageName(lang),
                    })) || []
                  }
                  onChange={(selectedOptions) => {
                    field.onChange(
                      selectedOptions.map((option) => option.value)
                    );
                  }}
                  placeholder="Dil seçiniz"
                  defaultOptions={languageOptions}
                  className="w-full"
                  hideClearAllButton
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Güncelle</Button>
      </form>
    </Form>
  );
}
