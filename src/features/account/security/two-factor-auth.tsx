import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  getTwoFactorStatus,
  generateQrCode,
  enableTwoFactor,
  disableTwoFactor,
  regenerateRecoveryCodes,
} from '@/services/two-factor-service';
import { Shield, Key, Download, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { PasswordInput } from '@/components/password-input';

const enableFormSchema = z.object({
  code: z.string().length(6, 'Doğrulama kodu 6 haneli olmalıdır.'),
});

const disableFormSchema = z.object({
  password: z.string().min(1, 'Şifre gereklidir.'),
});

const regenerateFormSchema = z.object({
  password: z.string().min(1, 'Şifre gereklidir.'),
});

type EnableFormValues = z.infer<typeof enableFormSchema>;
type DisableFormValues = z.infer<typeof disableFormSchema>;
type RegenerateFormValues = z.infer<typeof regenerateFormSchema>;

export function TwoFactorAuth() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [showEnableDialog, setShowEnableDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const [showRecoveryCodesDialog, setShowRecoveryCodesDialog] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const enableForm = useForm<EnableFormValues>({
    resolver: zodResolver(enableFormSchema),
    defaultValues: {
      code: '',
    },
  });

  const disableForm = useForm<DisableFormValues>({
    resolver: zodResolver(disableFormSchema),
    defaultValues: {
      password: '',
    },
  });

  const regenerateForm = useForm<RegenerateFormValues>({
    resolver: zodResolver(regenerateFormSchema),
    defaultValues: {
      password: '',
    },
  });

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const data = await getTwoFactorStatus();
      setIsEnabled(data.enabled);
    } catch (_error) {
      toast.error('Hata', {
        description: 'Durum yüklenirken bir hata oluştu.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQrCode = async () => {
    try {
      const data = await generateQrCode();
      setQrCode(data.qr_code);
      setSecret(data.secret);
      setShowEnableDialog(true);
    } catch (_error) {
      toast.error('Hata', {
        description: 'QR kod oluşturulurken bir hata oluştu.',
      });
    }
  };

  const handleEnable = async (values: EnableFormValues) => {
    try {
      const data = await enableTwoFactor(values.code);
      setRecoveryCodes(data.recovery_codes);
      setIsEnabled(true);
      setShowEnableDialog(false);
      setShowRecoveryCodesDialog(true);
      enableForm.reset();
      toast.success('Başarılı', {
        description: data.message,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : 'Bir hata oluştu.';
      toast.error('Hata', {
        description: errorMessage || 'Bir hata oluştu.',
      });
    }
  };

  const handleDisable = async (values: DisableFormValues) => {
    try {
      const data = await disableTwoFactor(values.password);
      setIsEnabled(false);
      setShowDisableDialog(false);
      disableForm.reset();
      toast.success('Başarılı', {
        description: data.message,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : 'Bir hata oluştu.';
      toast.error('Hata', {
        description: errorMessage || 'Bir hata oluştu.',
      });
    }
  };

  const handleRegenerate = async (values: RegenerateFormValues) => {
    try {
      const data = await regenerateRecoveryCodes(values.password);
      setRecoveryCodes(data.recovery_codes);
      setShowRegenerateDialog(false);
      setShowRecoveryCodesDialog(true);
      regenerateForm.reset();
      toast.success('Başarılı', {
        description: data.message,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : 'Bir hata oluştu.';
      toast.error('Hata', {
        description: errorMessage || 'Bir hata oluştu.',
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success('Kopyalandı', {
      description: 'Kod panoya kopyalandı.',
    });
  };

  const downloadRecoveryCodes = () => {
    const content = recoveryCodes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recovery-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>İki Faktörlü Kimlik Doğrulama</CardTitle>
          </div>
          <CardDescription>
            Hesabınıza ekstra bir güvenlik katmanı ekleyin. Giriş yaparken
            şifrenizin yanı sıra telefonunuzdaki doğrulama kodunu da girmeniz
            gerekecek.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <div className="font-medium">Durum</div>
              <div className="text-muted-foreground text-sm">
                {isEnabled ? 'Etkin' : 'Devre Dışı'}
              </div>
            </div>
            <div className="flex gap-2">
              {!isEnabled ? (
                <Button onClick={handleGenerateQrCode}>Etkinleştir</Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setShowRegenerateDialog(true)}
                  >
                    <Key className="mr-2 h-4 w-4" />
                    Kurtarma Kodlarını Yenile
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setShowDisableDialog(true)}
                  >
                    Devre Dışı Bırak
                  </Button>
                </>
              )}
            </div>
          </div>

          {isEnabled && (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                İki faktörlü kimlik doğrulama etkin. Hesabınız ek bir güvenlik
                katmanı ile korunuyor.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Enable Dialog */}
      <Dialog open={showEnableDialog} onOpenChange={setShowEnableDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>İki Faktörlü Doğrulamayı Etkinleştir</DialogTitle>
            <DialogDescription>
              Aşağıdaki QR kodunu Google Authenticator veya benzeri bir uygulama
              ile tarayın.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {qrCode && (
              <div className="flex flex-col items-center space-y-4">
                <div
                  className="rounded-lg border bg-white p-4"
                  dangerouslySetInnerHTML={{ __html: qrCode }}
                />
                {secret && (
                  <div className="w-full space-y-2">
                    <p className="text-muted-foreground text-center text-sm">
                      QR kodu tarayamıyorsanız, bu kodu manuel olarak girin:
                    </p>
                    <div className="flex items-center gap-2">
                      <Input value={secret} readOnly className="font-mono" />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(secret)}
                      >
                        {copiedCode === secret ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <Form {...enableForm}>
              <form
                onSubmit={enableForm.handleSubmit(handleEnable)}
                className="space-y-4"
              >
                <FormField
                  control={enableForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doğrulama Kodu</FormLabel>
                      <FormControl>
                        <Input placeholder="000000" maxLength={6} {...field} />
                      </FormControl>
                      <FormDescription>
                        Uygulamanızda görünen 6 haneli kodu girin.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowEnableDialog(false);
                      enableForm.reset();
                    }}
                  >
                    İptal
                  </Button>
                  <Button type="submit">Etkinleştir</Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Disable Dialog */}
      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>İki Faktörlü Doğrulamayı Devre Dışı Bırak</DialogTitle>
            <DialogDescription>
              Devam etmek için şifrenizi girin. Bu işlem hesabınızın güvenliğini
              azaltacaktır.
            </DialogDescription>
          </DialogHeader>

          <Form {...disableForm}>
            <form
              onSubmit={disableForm.handleSubmit(handleDisable)}
              className="space-y-4"
            >
              <FormField
                control={disableForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Şifre</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder="Şifrenizi girin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowDisableDialog(false);
                    disableForm.reset();
                  }}
                >
                  İptal
                </Button>
                <Button type="submit" variant="destructive">
                  Devre Dışı Bırak
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Regenerate Dialog */}
      <Dialog
        open={showRegenerateDialog}
        onOpenChange={setShowRegenerateDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kurtarma Kodlarını Yenile</DialogTitle>
            <DialogDescription>
              Yeni kurtarma kodları oluşturulacak. Eski kodlar geçersiz olacak.
              Devam etmek için şifrenizi girin.
            </DialogDescription>
          </DialogHeader>

          <Form {...regenerateForm}>
            <form
              onSubmit={regenerateForm.handleSubmit(handleRegenerate)}
              className="space-y-4"
            >
              <FormField
                control={regenerateForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Şifre</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder="Şifrenizi girin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowRegenerateDialog(false);
                    regenerateForm.reset();
                  }}
                >
                  İptal
                </Button>
                <Button type="submit">Yenile</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Recovery Codes Dialog */}
      <Dialog
        open={showRecoveryCodesDialog}
        onOpenChange={setShowRecoveryCodesDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kurtarma Kodları</DialogTitle>
            <DialogDescription>
              Bu kodları güvenli bir yerde saklayın. Telefonunuza erişiminizi
              kaybederseniz bu kodlarla giriş yapabilirsiniz. Her kod sadece bir
              kez kullanılabilir.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert>
              <AlertDescription className="text-sm">
                Bu kodları bir daha göremeyeceksiniz. Lütfen güvenli bir yerde
                saklayın.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-2">
              {recoveryCodes.map((code, index) => (
                <div
                  key={index}
                  className="bg-muted flex items-center justify-between rounded-md border p-2"
                >
                  <code className="font-mono text-sm">{code}</code>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(code)}
                  >
                    {copiedCode === code ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={downloadRecoveryCodes}
            >
              <Download className="mr-2 h-4 w-4" />
              İndir
            </Button>
            <Button onClick={() => setShowRecoveryCodesDialog(false)}>
              Anladım
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
