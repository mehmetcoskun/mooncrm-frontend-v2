import { useState, useEffect } from 'react';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { verifyTwoFactor } from '@/services/auth-service';
import { updateUser } from '@/services/user-service';
import { Cable, Loader2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Switch } from '@/components/ui/switch';
import { PermissionGuard } from '@/components/auth/permission-guard';

const twoFactorSchema = z.object({
  code: z.string().min(6, 'Doğrulama kodu en az 6 karakter olmalıdır'),
});

export function LeadSwitch() {
  const { user } = useAuth();
  const [enabled, setEnabled] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [pendingChecked, setPendingChecked] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState<boolean>(false);

  const form = useForm<z.infer<typeof twoFactorSchema>>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: {
      code: '',
    },
  });

  useEffect(() => {
    if (user?.work_schedule) {
      setEnabled(user.work_schedule.is_active ?? false);
    } else {
      setEnabled(false);
    }
  }, [user]);

  const handleToggle = (checked: boolean) => {
    if (!user?.id) {
      toast.error('Hata', {
        description: 'Kullanıcı bilgisi bulunamadı.',
      });
      return;
    }

    setEnabled(checked);
    setPendingChecked(checked);

    if (!user.two_factor_enabled) {
      setRequiresTwoFactor(false);
      setDialogOpen(true);
    } else {
      setRequiresTwoFactor(true);
      setDialogOpen(true);
    }
  };

  const handleDirectUpdate = async () => {
    if (!user?.id) {
      toast.error('Hata', {
        description: 'Kullanıcı bilgisi bulunamadı.',
      });
      return;
    }

    try {
      setIsVerifying(true);

      const currentWorkSchedule = user.work_schedule || {
        is_active: false,
        days: [],
      };
      const updatedWorkSchedule = {
        ...currentWorkSchedule,
        is_active: pendingChecked,
      };

      await updateUser(user.id, {
        work_schedule: updatedWorkSchedule,
      });

      setDialogOpen(false);

      toast.success('Başarılı', {
        description: `Lead alma ${pendingChecked ? 'aktif' : 'pasif'} edildi.`,
      });
    } catch (error) {
      toast.error('Hata', {
        description: `İşlem sırasında bir hata oluştu: ${error instanceof AxiosError ? error.response?.data.message : 'Bilinmeyen hata'}`,
      });
      setEnabled(!pendingChecked);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyAndUpdate = async (
    data: z.infer<typeof twoFactorSchema>
  ) => {
    if (!user?.id) {
      toast.error('Hata', {
        description: 'Kullanıcı bilgisi bulunamadı.',
      });
      return;
    }

    try {
      setIsVerifying(true);

      await verifyTwoFactor(user.id, data.code);

      const currentWorkSchedule = user.work_schedule || {
        is_active: false,
        days: [],
      };
      const updatedWorkSchedule = {
        ...currentWorkSchedule,
        is_active: pendingChecked,
      };

      await updateUser(user.id, {
        work_schedule: updatedWorkSchedule,
      });

      setDialogOpen(false);
      form.reset();

      toast.success('Başarılı', {
        description: `Lead alma ${pendingChecked ? 'aktif' : 'pasif'} edildi.`,
      });
    } catch (error) {
      toast.error('Hata', {
        description: `İşlem sırasında bir hata oluştu: ${error instanceof AxiosError ? error.response?.data.message : 'Bilinmeyen hata'}`,
      });
      setEnabled(!pendingChecked);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setEnabled(!pendingChecked);
      form.reset();
    }
    setDialogOpen(open);
  };

  return (
    <PermissionGuard roleId={3}>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="scale-95 rounded-full">
            <Cable className="size-[1.2rem]" />
            <span className="sr-only">Lead Alma Durumu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Lead Alma Durumu</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={(e) => e.preventDefault()}
            className="flex items-center justify-between"
            disabled={isVerifying}
          >
            <span>Aktif/Pasif</span>
            <Switch
              checked={enabled}
              onCheckedChange={handleToggle}
              disabled={isVerifying}
            />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-md">
          {requiresTwoFactor ? (
            <>
              <DialogHeader>
                <DialogTitle>İki Faktörlü Doğrulama</DialogTitle>
                <DialogDescription>
                  Lead alma durumunu {pendingChecked ? 'aktif' : 'pasif'} etmek
                  için lütfen 2FA kodunuzu girin.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleVerifyAndUpdate)}
                  className="space-y-4"
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
                            disabled={isVerifying}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Authenticator uygulamanızdan 6 haneli kodu girin veya
                          10 haneli kurtarma kodunuzu kullanın.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleDialogClose(false)}
                      disabled={isVerifying}
                    >
                      İptal
                    </Button>
                    <Button type="submit" disabled={isVerifying}>
                      {isVerifying ? (
                        <>
                          <Loader2 className="mr-2 animate-spin" />
                          Doğrulanıyor...
                        </>
                      ) : (
                        <>
                          <Shield className="mr-2" />
                          Doğrula
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Lead Alma Durumunu Değiştir</DialogTitle>
                <DialogDescription>
                  Lead alma durumunu {pendingChecked ? 'aktif' : 'pasif'} etmek
                  istediğinizden emin misiniz?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDialogClose(false)}
                  disabled={isVerifying}
                >
                  İptal
                </Button>
                <Button
                  type="button"
                  onClick={handleDirectUpdate}
                  disabled={isVerifying}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" />
                      Güncelleniyor...
                    </>
                  ) : (
                    'Onayla'
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PermissionGuard>
  );
}
