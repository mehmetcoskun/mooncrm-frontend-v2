import { useState } from 'react';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import type { LoginResponse } from '@/types/auth';
import { Loader2, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
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
import { PasswordInput } from '@/components/password-input';

const formSchema = z.object({
  organization_code: z.string(),
  email: z.email({
    error: (iss) =>
      iss.input === '' ? 'Lütfen e-posta adresinizi giriniz' : undefined,
  }),
  password: z
    .string()
    .min(1, 'Lütfen şifrenizi giriniz')
    .min(7, 'Şifre en az 7 karakter olmalıdır'),
});

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string;
  onTwoFactorRequired?: (userId: number) => void;
  onPasswordChangeRequired?: () => void;
}

export function UserAuthForm({
  className,
  redirectTo,
  onTwoFactorRequired,
  onPasswordChangeRequired,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organization_code: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const response: LoginResponse = await login(data);

      if (response.requires_two_factor && response.user_id) {
        setIsLoading(false);
        if (onTwoFactorRequired) {
          onTwoFactorRequired(response.user_id);
        }
        return;
      }

      if (response.needs_password_change) {
        setIsLoading(false);
        if (onPasswordChangeRequired) {
          onPasswordChangeRequired();
        }
        return;
      }

      toast.success('Giriş başarılı', {
        description: 'Hoş geldiniz!',
      });
      navigate({ to: redirectTo || '/', replace: true });
    } catch (error) {
      toast.error('Giriş başarısız', {
        description:
          error instanceof AxiosError
            ? (error.response?.data?.message ?? 'Bir hata oluştu')
            : 'Bir hata oluştu',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name="organization_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kurum Kodu</FormLabel>
              <FormControl>
                <Input placeholder="xxxx" {...field} />
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
                <Input placeholder="name@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="relative">
              <FormLabel>Şifre</FormLabel>
              <FormControl>
                <PasswordInput placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="mt-2" disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin" /> : <LogIn />}
          Giriş Yap
        </Button>
      </form>
    </Form>
  );
}
