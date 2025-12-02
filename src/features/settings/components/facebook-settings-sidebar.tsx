import { useCallback, useEffect, useState } from 'react';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getSetting, updateOrCreateSetting } from '@/services/setting-service';
import { Facebook } from 'lucide-react';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

const formSchema = z.object({
  access_token: z.string().optional(),
  expires_in: z.number().optional(),
});
type FacebookSettingsForm = z.infer<typeof formSchema>;

interface FacebookSettingsSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  subscribed: boolean;
}

export function FacebookSettingsSidebar({
  open,
  onOpenChange,
}: FacebookSettingsSidebarProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [loadingPages, setLoadingPages] = useState<Record<string, boolean>>({});

  const form = useForm<FacebookSettingsForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      access_token: undefined,
      expires_in: undefined,
    },
  });

  const loadPages = useCallback(async (accessToken: string) => {
    try {
      setLoadingPages({});
      const response = await fetch(
        `https://graph.facebook.com/v24.0/me/accounts?access_token=${accessToken}`
      );
      const data = await response.json();

      if (data.error) {
        toast.error('Hata', {
          description: 'Facebook sayfaları yüklenirken bir hata oluştu.',
        });
        return;
      }

      const pagesData = data.data || [];
      const pagesWithSubscription = await Promise.all(
        pagesData.map(
          async (page: { id: string; name: string; access_token: string }) => {
            const subscriptionStatus = await checkSubscription(
              page.id,
              page.access_token
            );
            return {
              id: page.id,
              name: page.name,
              access_token: page.access_token,
              subscribed: subscriptionStatus,
            };
          }
        )
      );

      setPages(pagesWithSubscription);
    } catch (_error) {
      toast.error('Hata', {
        description: 'Facebook sayfaları yüklenirken bir hata oluştu.',
      });
    }
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      setIsFetching(true);
      const settings = await getSetting();

      if (settings?.facebook_settings) {
        const facebookSettings = settings.facebook_settings;

        form.reset({
          access_token: facebookSettings.access_token || undefined,
          expires_in: facebookSettings.expires_in || undefined,
        });

        if (facebookSettings.access_token) {
          setIsConnected(true);
          await loadPages(facebookSettings.access_token);
        }
      }
    } catch (error) {
      toast.error('Hata', {
        description:
          error instanceof AxiosError
            ? error.response?.data?.message
            : 'Ayarlar yüklenirken bir hata oluştu.',
      });
    } finally {
      setIsFetching(false);
    }
  }, [form, loadPages]);

  const checkSubscription = async (
    pageId: string,
    pageAccessToken: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v24.0/${pageId}/subscribed_apps?access_token=${pageAccessToken}`
      );
      const data = await response.json();

      if (data.error) {
        return false;
      }

      const appId = import.meta.env.VITE_FACEBOOK_APP_ID;
      const subscribedApps = data.data || [];
      return subscribedApps.some((app: { id: string }) => app.id === appId);
    } catch (_error) {
      return false;
    }
  };

  const handleSubscribe = async (pageId: string, pageAccessToken: string) => {
    try {
      setLoadingPages((prev) => ({ ...prev, [pageId]: true }));

      const response = await fetch(
        `https://graph.facebook.com/v24.0/${pageId}/subscribed_apps`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subscribed_fields: 'leadgen',
            access_token: pageAccessToken,
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        toast.error('Hata', {
          description: 'Sayfaya abone olunurken bir hata oluştu.',
        });
        return;
      }

      if (data.success) {
        toast.success('Başarılı', {
          description: 'Sayfaya başarıyla abone oldunuz.',
        });

        setPages((prev) =>
          prev.map((page) =>
            page.id === pageId ? { ...page, subscribed: true } : page
          )
        );
      }
    } catch (_error) {
      toast.error('Hata', {
        description: 'Sayfaya abone olunurken bir hata oluştu.',
      });
    } finally {
      setLoadingPages((prev) => ({ ...prev, [pageId]: false }));
    }
  };

  const handleUnsubscribe = async (pageId: string, pageAccessToken: string) => {
    try {
      setLoadingPages((prev) => ({ ...prev, [pageId]: true }));

      const response = await fetch(
        `https://graph.facebook.com/v24.0/${pageId}/subscribed_apps`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            access_token: pageAccessToken,
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        toast.error('Hata', {
          description: 'Sayfa aboneliği iptal edilirken bir hata oluştu.',
        });
        return;
      }

      if (data.success) {
        toast.success('Başarılı', {
          description: 'Sayfa aboneliği başarıyla iptal edildi.',
        });

        setPages((prev) =>
          prev.map((page) =>
            page.id === pageId ? { ...page, subscribed: false } : page
          )
        );
      }
    } catch (_error) {
      toast.error('Hata', {
        description: 'Sayfa aboneliği iptal edilirken bir hata oluştu.',
      });
    } finally {
      setLoadingPages((prev) => ({ ...prev, [pageId]: false }));
    }
  };

  useEffect(() => {
    if (open) {
      loadSettings();
    }
  }, [open, loadSettings]);

  const handleFacebookResponse = async (response: {
    accessToken?: string;
    expiresIn?: number;
    status?: string;
  }) => {
    try {
      if (!response.accessToken) {
        toast.error('Hata', {
          description: 'Facebook bağlantısı başarısız oldu.',
        });
        return;
      }

      setIsLoading(true);

      const settingsData = {
        facebook_settings: {
          access_token: response.accessToken,
          expires_in: response.expiresIn,
        },
      };

      const result = await updateOrCreateSetting(settingsData);

      toast.success('Başarılı', {
        description:
          result?.message || 'Facebook bağlantısı başarıyla kuruldu.',
      });

      form.reset({
        access_token: response.accessToken,
        expires_in: response.expiresIn,
      });

      setIsConnected(true);
      await loadPages(response.accessToken);
    } catch (error) {
      toast.error('Hata', {
        description:
          error instanceof AxiosError
            ? error.response?.data?.message
            : 'Facebook bağlantısı kurulurken bir hata oluştu.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookFailure = () => {
    toast.error('Hata', {
      description: 'Facebook bağlantısı başarısız oldu.',
    });
  };

  const handleDisconnect = async () => {
    try {
      setIsLoading(true);

      const settingsData = {
        facebook_settings: null,
      };

      const result = await updateOrCreateSetting(settingsData);

      toast.success('Başarılı', {
        description:
          result?.message || 'Facebook bağlantısı başarıyla kesildi.',
      });

      form.reset({
        access_token: undefined,
        expires_in: undefined,
      });

      setIsConnected(false);
      setPages([]);
    } catch (error) {
      toast.error('Hata', {
        description:
          error instanceof AxiosError
            ? error.response?.data?.message
            : 'Facebook bağlantısı kesilirken bir hata oluştu.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(state) => {
        form.reset({
          access_token: undefined,
          expires_in: undefined,
        });
        setIsConnected(false);
        setPages([]);
        onOpenChange(state);
      }}
    >
      <SheetContent className="w-full overflow-y-auto p-4 sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Facebook className="h-5 w-5" />
            Facebook Ayarları
          </SheetTitle>
          <SheetDescription>
            Facebook hesabınızı bağlayın ve sayfalarınızı yönetin.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <Form {...form}>
            <form id="facebook-settings-form" className="space-y-6">
              {!isConnected ? (
                <FormField
                  control={form.control}
                  name="access_token"
                  render={() => (
                    <FormItem className="space-y-3">
                      <FormLabel>Facebook Bağlantısı</FormLabel>
                      <FormControl>
                        <div className="flex flex-col gap-3">
                          <p className="text-muted-foreground text-sm">
                            Facebook hesabınızı bağlamak için aşağıdaki butona
                            tıklayın.
                          </p>
                          <FacebookLogin
                            appId={import.meta.env.VITE_FACEBOOK_APP_ID}
                            autoLoad={false}
                            fields="name,email"
                            scope="pages_show_list,ads_management,business_management,leads_retrieval,pages_read_engagement,pages_manage_metadata,pages_manage_ads"
                            callback={handleFacebookResponse}
                            onFailure={handleFacebookFailure}
                            isDisabled={isLoading || isFetching}
                            render={(renderProps: {
                              onClick: () => void;
                              isDisabled: boolean;
                            }) => (
                              <Button
                                type="button"
                                onClick={renderProps.onClick}
                                disabled={renderProps.isDisabled}
                                className="w-full"
                              >
                                <Facebook className="mr-2 h-4 w-4" />
                                Bağlan
                              </Button>
                            )}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <div className="space-y-6">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Facebook className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">Facebook Bağlı</p>
                          <p className="text-muted-foreground text-sm">
                            Hesabınız başarıyla bağlandı
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleDisconnect}
                        disabled={isLoading}
                      >
                        Bağlantıyı Kes
                      </Button>
                    </div>
                  </div>

                  {pages.length > 0 && (
                    <div className="space-y-3">
                      <Label>Facebook Sayfalarınız</Label>
                      <div className="space-y-2">
                        {pages.map((page) => (
                          <div
                            key={page.id}
                            className="hover:bg-accent/50 flex items-center justify-between rounded-lg border p-4"
                          >
                            <div className="flex-1">
                              <p className="font-medium">{page.name}</p>
                              <p className="text-muted-foreground text-xs">
                                {page.subscribed ? 'Abone' : 'Abone Değil'}
                              </p>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant={
                                page.subscribed ? 'destructive' : 'default'
                              }
                              onClick={() =>
                                page.subscribed
                                  ? handleUnsubscribe(
                                      page.id,
                                      page.access_token
                                    )
                                  : handleSubscribe(page.id, page.access_token)
                              }
                              disabled={loadingPages[page.id]}
                            >
                              {loadingPages[page.id]
                                ? 'İşleniyor...'
                                : page.subscribed
                                  ? 'Abonelikten Çık'
                                  : 'Abone Ol'}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
