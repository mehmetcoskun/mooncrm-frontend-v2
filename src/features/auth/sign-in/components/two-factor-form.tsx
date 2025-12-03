import { useState } from 'react';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { Loader2, Shield } from 'lucide-react';
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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  code: z.string().min(6, 'Doğrulama kodu en az 6 karakter olmalıdır'),
});

interface TwoFactorFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string;
  userId: number;
  onBack?: () => void;
  onPasswordChangeRequired?: () => void;
}

export function TwoFactorForm({
  className,
  redirectTo,
  userId,
  onBack,
  onPasswordChangeRequired,
  ...props
}: TwoFactorFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { verifyTwoFactor } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const response = await verifyTwoFactor({ userId, code: data.code });

      if (response.needs_password_change) {
        setIsLoading(false);
        if (onPasswordChangeRequired) {
          onPasswordChangeRequired();
        }
        return;
      }

      toast.success('Doğrulama başarılı', {
        description: 'İki faktörlü doğrulama tamamlandı!',
      });
      navigate({ to: redirectTo || '/', replace: true });
    } catch (error) {
      toast.error('Doğrulama başarısız', {
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
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Doğrulama Kodu</FormLabel>
              <FormControl>
                <Input
                  placeholder="000000"
                  maxLength={10}
                  autoComplete="one-time-code"
                  autoFocus
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Authenticator uygulamanızdan 6 haneli kodu girin veya 10 haneli
                kurtarma kodunuzu kullanın.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="mt-2 flex gap-2">
          {onBack && (
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={isLoading}
              className="flex-1"
            >
              Geri
            </Button>
          )}
          <Button className="flex-1" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : <Shield />}
            Doğrula
          </Button>
        </div>
      </form>
    </Form>
  );
}
