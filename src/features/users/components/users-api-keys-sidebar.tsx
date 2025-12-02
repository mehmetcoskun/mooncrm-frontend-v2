import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { createToken, destroyToken, getTokens } from '@/services/user-service';
import { tr } from 'date-fns/locale';
import { Copy, Key, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/use-permissions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { type User } from '../data/schema';

interface Token {
  id: number;
  name: string;
  created_at: string;
  last_used_at: string | null;
}

interface Props {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UsersApiKeysSidebar({ user, open, onOpenChange }: Props) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [tokenName, setTokenName] = useState('');
  const [generatedToken, setGeneratedToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingToken, setIsCreatingToken] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tokenToDelete, setTokenToDelete] = useState<Token | null>(null);

  const { hasPermission } = usePermissions();
  const canCreateApiKey = hasPermission('user_ApiKeyCreate');
  const canDeleteApiKey = hasPermission('user_ApiKeyDelete');

  const fetchTokens = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const data = await getTokens(user.id);
      setTokens(data);
    } catch (_error) {
      toast.error('Hata', {
        description: 'API anahtarları yüklenirken bir hata oluştu.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (open && user) {
      fetchTokens();
    }
  }, [open, user, fetchTokens]);

  const handleCreateToken = async () => {
    if (!user || !tokenName.trim()) return;

    setIsCreatingToken(true);
    try {
      const response = await createToken(user.id, { name: tokenName.trim() });
      setGeneratedToken(response.token);
      setTokenName('');
      await fetchTokens();
      toast.success('Başarılı', {
        description: 'API anahtarı başarıyla oluşturuldu.',
      });
    } catch (_error) {
      toast.error('Hata', {
        description: 'API anahtarı oluşturulurken bir hata oluştu.',
      });
    } finally {
      setIsCreatingToken(false);
    }
  };

  const handleDeleteToken = async (token: Token) => {
    if (!user) return;

    try {
      await destroyToken(user.id, token.id);
      setTokens(tokens.filter((t) => t.id !== token.id));
      toast.success('Başarılı', {
        description: 'API anahtarı başarıyla silindi.',
      });
    } catch (_error) {
      toast.error('Hata', {
        description: 'API anahtarı silinirken bir hata oluştu.',
      });
    } finally {
      setDeleteDialogOpen(false);
      setTokenToDelete(null);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Başarılı', {
        description: 'API anahtarı panoya kopyalandı.',
      });
    } catch (_error) {
      toast.error('Hata', {
        description: 'API anahtarı kopyalanamadı.',
      });
    }
  };

  const handleClose = () => {
    setGeneratedToken('');
    setTokenName('');
    onOpenChange(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={handleClose}>
        <SheetContent className="w-full p-4">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Anahtarı Yönetimi
            </SheetTitle>
            <SheetDescription>
              {user?.name} kullanıcısının API anahtarlarını yönetin.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Create new token section */}
            {canCreateApiKey && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Yeni API Anahtarı Oluştur
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tokenName">API Anahtarı Adı</Label>
                    <Input
                      id="tokenName"
                      placeholder="Örn: Mobile App API Key"
                      value={tokenName}
                      onChange={(e) => setTokenName(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleCreateToken}
                    disabled={!tokenName.trim() || isCreatingToken}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {isCreatingToken
                      ? 'Oluşturuluyor...'
                      : 'API Anahtarı Oluştur'}
                  </Button>

                  {/* Generated token display */}
                  {generatedToken && (
                    <div className="mt-4 space-y-2">
                      <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="text-sm font-medium text-orange-800">
                            Önemli: Bu API anahtarı sadece bir kez
                            gösterilecektir!
                          </span>
                        </div>
                        <p className="text-xs text-orange-700">
                          Lütfen güvenli bir yere kaydedin.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          value={generatedToken}
                          readOnly
                          className="font-mono text-xs"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(generatedToken)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setGeneratedToken('')}
                        className="w-full"
                      >
                        Tamam
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Separator />

            {/* Existing tokens section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Mevcut API Anahtarları</h3>
                <Badge variant="secondary">{tokens.length} anahtar</Badge>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground text-sm">
                    Yükleniyor...
                  </div>
                </div>
              ) : tokens.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Key className="text-muted-foreground mb-4 h-12 w-12" />
                  <h4 className="text-muted-foreground text-sm font-medium">
                    Henüz API anahtarı oluşturulmamış
                  </h4>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Yukarıdaki formu kullanarak yeni bir API anahtarı oluşturun.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tokens.map((token) => (
                    <Card key={token.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-2">
                              <Key className="text-muted-foreground h-4 w-4" />
                              <span className="font-medium">{token.name}</span>
                            </div>
                            <div className="text-muted-foreground space-y-1 text-xs">
                              <div className="flex items-center gap-2">
                                <span>Oluşturulma:</span>
                                <span className="font-mono">
                                  {format(
                                    new Date(token.created_at),
                                    'dd MMM yyyy HH:mm',
                                    {
                                      locale: tr,
                                    }
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span>Son Kullanım:</span>
                                <span className="font-mono">
                                  {token.last_used_at
                                    ? format(
                                        new Date(token.last_used_at),
                                        'dd MMM yyyy HH:mm',
                                        {
                                          locale: tr,
                                        }
                                      )
                                    : 'Henüz kullanılmadı'}
                                </span>
                              </div>
                            </div>
                          </div>
                          {canDeleteApiKey && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setTokenToDelete(token);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>API Anahtarını Sil</AlertDialogTitle>
            <AlertDialogDescription>
              "{tokenToDelete?.name}" adlı API anahtarını silmek istediğinizden
              emin misiniz? Bu işlem geri alınamaz ve bu anahtarı kullanan tüm
              uygulamalar artık çalışmayacaktır.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => tokenToDelete && handleDeleteToken(tokenToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
