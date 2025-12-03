import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/services/category-service';
import { CopyIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type Category } from '@/features/categories/data/schema';
import { type Styles, type RateLimitSettings } from '../data/schema';

type WebFormsSettingsTabsProps = {
  uuid: string;
  styles: Styles;
  onStylesChange: (styles: Styles) => void;
  redirect_url: string;
  onRedirectUrlChange: (url: string) => void;
  email_recipients: string | null;
  onEmailRecipientsChange: (emails: string) => void;
  domain: string;
  onDomainChange: (domain: string) => void;
  category_id?: number | null;
  onCategoryIdChange: (id?: number | null) => void;
  rate_limit_settings: RateLimitSettings;
  onRateLimitSettingsChange: (settings: RateLimitSettings) => void;
};

export function WebFormsSettingsTabs({
  uuid,
  styles,
  onStylesChange,
  redirect_url,
  onRedirectUrlChange,
  email_recipients,
  onEmailRecipientsChange,
  domain,
  onDomainChange,
  category_id,
  onCategoryIdChange,
  rate_limit_settings,
  onRateLimitSettingsChange,
}: WebFormsSettingsTabsProps) {
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  // Dinamik olarak iframe linkini oluştur
  const baseUrl = window.location.origin;
  const iframeLink = `${baseUrl}/web-form/iframe/${uuid}`;
  const iframeCode = `<iframe src="${iframeLink}" height="100%" width="100%" frameborder="0"></iframe>`;

  const handleCopyIframeLink = () => {
    navigator.clipboard.writeText(iframeLink);
    toast.success('Başarılı', {
      description: 'Iframe linki kopyalandı',
    });
  };

  const handleCopyIframeCode = () => {
    navigator.clipboard.writeText(iframeCode);
    toast.success('Başarılı', {
      description: 'Iframe kodu kopyalandı',
    });
  };

  return (
    <div className="bg-card h-full overflow-y-auto rounded-lg border">
      <Tabs defaultValue="messages" className="h-full">
        <TabsList className="m-4 w-[calc(100%-2rem)]">
          <TabsTrigger value="messages" className="flex-1">
            Uyarı Mesajları
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex-1">
            Form Ayarları
          </TabsTrigger>
          <TabsTrigger value="styling" className="flex-1">
            Form Özelleştirme
          </TabsTrigger>
          <TabsTrigger value="embed" className="flex-1">
            Iframe
          </TabsTrigger>
        </TabsList>

        <div className="p-4 pt-0">
          {/* Uyarı Mesajları */}
          <TabsContent value="messages" className="space-y-4">
            <div className="space-y-2">
              <Label>Zorunlu Alan</Label>
              <Input
                value={styles.alertMessages.required}
                onChange={(e) =>
                  onStylesChange({
                    ...styles,
                    alertMessages: {
                      ...styles.alertMessages,
                      required: e.target.value,
                    },
                  })
                }
                placeholder="Lütfen tüm zorunlu alanları doldurun."
              />
            </div>

            <div className="space-y-2">
              <Label>Başarılı Mesaj</Label>
              <Input
                value={styles.alertMessages.success}
                onChange={(e) =>
                  onStylesChange({
                    ...styles,
                    alertMessages: {
                      ...styles.alertMessages,
                      success: e.target.value,
                    },
                  })
                }
                placeholder="Form başarıyla gönderildi."
              />
            </div>

            <div className="space-y-2">
              <Label>Hata Mesajı</Label>
              <Input
                value={styles.alertMessages.failure}
                onChange={(e) =>
                  onStylesChange({
                    ...styles,
                    alertMessages: {
                      ...styles.alertMessages,
                      failure: e.target.value,
                    },
                  })
                }
                placeholder="Form gönderilirken bir hata oluştu."
              />
            </div>

            <div className="space-y-2">
              <Label>Geçersiz Girdi Mesajı</Label>
              <Input
                value={styles.alertMessages.invalidInput}
                onChange={(e) =>
                  onStylesChange({
                    ...styles,
                    alertMessages: {
                      ...styles.alertMessages,
                      invalidInput: e.target.value,
                    },
                  })
                }
                placeholder="Lütfen geçerli bir değer giriniz."
              />
            </div>

            <div className="space-y-2">
              <Label>Rate Limit Hata Mesajı</Label>
              <Input
                value={styles.alertMessages.rateLimit || ''}
                onChange={(e) =>
                  onStylesChange({
                    ...styles,
                    alertMessages: {
                      ...styles.alertMessages,
                      rateLimit: e.target.value,
                    },
                  })
                }
                placeholder="Çok hızlı form gönderimi."
              />
            </div>
          </TabsContent>

          {/* Form Ayarları */}
          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-2">
              <Label>Yönlendirme URL</Label>
              <Input
                value={redirect_url}
                onChange={(e) => onRedirectUrlChange(e.target.value)}
                placeholder="Gönderim sonrası yönlendirilecek URL"
              />
            </div>

            <div className="space-y-2">
              <Label>E-Posta</Label>
              <Input
                value={email_recipients || ''}
                onChange={(e) => onEmailRecipientsChange(e.target.value)}
                placeholder="E-Posta adresleri"
              />
              <p className="text-muted-foreground text-xs">
                Formların gitmesini istediğiniz kişilerin e-posta adreslerini
                giriniz. (Virgül ile ayırın)
              </p>
              <p className="text-muted-foreground text-xs text-amber-600 dark:text-amber-400">
                ⚠️ Dikkat: SMTP ayarlarındaki gönderici e-posta adresi bu alıcı
                listesinde bulunmamalıdır.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Domain</Label>
              <Input
                value={domain}
                onChange={(e) => onDomainChange(e.target.value)}
                placeholder="*"
              />
              <p className="text-muted-foreground text-xs">
                Varsayılan olarak "*" tüm domainler anlamına gelir.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select
                value={category_id?.toString() || ''}
                onValueChange={(value) =>
                  onCategoryIdChange(value ? parseInt(value) : null)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Kategori Seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category: Category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                    >
                      {category.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rate Limiting */}
            <div className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <Label>Rate Limiting</Label>
                <Switch
                  checked={rate_limit_settings.enabled}
                  onCheckedChange={(checked) =>
                    onRateLimitSettingsChange({
                      ...rate_limit_settings,
                      enabled: checked,
                    })
                  }
                />
              </div>
              <p className="text-muted-foreground text-xs">
                Rate limiting, aynı IP adresinden belirli bir süre içinde
                yapılabilecek form gönderimlerini sınırlar.
              </p>

              {rate_limit_settings.enabled && (
                <div className="space-y-2">
                  <Label>Dakikada Maksimum Form Sayısı</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={rate_limit_settings.maxSubmissionsPerMinute}
                      onChange={(e) =>
                        onRateLimitSettingsChange({
                          ...rate_limit_settings,
                          maxSubmissionsPerMinute: parseInt(e.target.value),
                        })
                      }
                    />
                    <span className="text-muted-foreground text-sm">
                      adet/dakika
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Aynı IP adresinden 1 dakika içinde gönderilebilecek maksimum
                    form sayısı. Güvenlik için önerilen: 1-3 arası.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Form Özelleştirme */}
          <TabsContent value="styling" className="space-y-4">
            <div className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <Label>Form Arkaplanı</Label>
                <Switch
                  checked={styles.containerBgEnabled}
                  onCheckedChange={(checked) =>
                    onStylesChange({
                      ...styles,
                      containerBgEnabled: checked,
                    })
                  }
                />
              </div>
              {styles.containerBgEnabled && (
                <div className="flex items-center gap-2">
                  <Label>Arkaplan Rengi</Label>
                  <Input
                    type="color"
                    value={styles.containerBg}
                    onChange={(e) =>
                      onStylesChange({
                        ...styles,
                        containerBg: e.target.value,
                      })
                    }
                    className="h-10 w-20"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Input Görünümü</Label>
              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <Label className="w-32">Arkaplan Rengi</Label>
                  <Input
                    type="color"
                    value={styles.inputBg}
                    onChange={(e) =>
                      onStylesChange({
                        ...styles,
                        inputBg: e.target.value,
                      })
                    }
                    className="h-10 w-20"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="w-32">Yazı Rengi</Label>
                  <Input
                    type="color"
                    value={styles.inputTextColor}
                    onChange={(e) =>
                      onStylesChange({
                        ...styles,
                        inputTextColor: e.target.value,
                      })
                    }
                    className="h-10 w-20"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="w-32">Kenar Rengi</Label>
                  <Input
                    type="color"
                    value={styles.inputBorderColor}
                    onChange={(e) =>
                      onStylesChange({
                        ...styles,
                        inputBorderColor: e.target.value,
                      })
                    }
                    className="h-10 w-20"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Etiket Görünümü</Label>
              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <Label className="w-32">Yazı Rengi</Label>
                  <Input
                    type="color"
                    value={styles.labelColor}
                    onChange={(e) =>
                      onStylesChange({
                        ...styles,
                        labelColor: e.target.value,
                      })
                    }
                    className="h-10 w-20"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="w-32">Yazı Boyutu</Label>
                  <Input
                    type="number"
                    value={styles.labelFontSize}
                    onChange={(e) =>
                      onStylesChange({
                        ...styles,
                        labelFontSize: e.target.value,
                      })
                    }
                    className="w-20"
                  />
                  <span className="text-muted-foreground text-sm">px</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Gönder Butonu</Label>
              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <Label className="w-32">Arkaplan Rengi</Label>
                  <Input
                    type="color"
                    value={styles.buttonBgColor}
                    onChange={(e) =>
                      onStylesChange({
                        ...styles,
                        buttonBgColor: e.target.value,
                      })
                    }
                    className="h-10 w-20"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Buton Etiketi</Label>
                  <Input
                    value={styles.buttonLabel}
                    onChange={(e) =>
                      onStylesChange({
                        ...styles,
                        buttonLabel: e.target.value,
                      })
                    }
                    placeholder="Gönder"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <Label>Kenar Çizgisi</Label>
                <Switch
                  checked={styles.iframeBorderEnabled}
                  onCheckedChange={(checked) =>
                    onStylesChange({
                      ...styles,
                      iframeBorderEnabled: checked,
                    })
                  }
                />
              </div>
              {styles.iframeBorderEnabled && (
                <div className="flex items-center gap-2">
                  <Label>Kenar Rengi</Label>
                  <Input
                    type="color"
                    value={styles.iframeBorderColor}
                    onChange={(e) =>
                      onStylesChange({
                        ...styles,
                        iframeBorderColor: e.target.value,
                      })
                    }
                    className="h-10 w-20"
                  />
                </div>
              )}
            </div>
          </TabsContent>

          {/* Iframe */}
          <TabsContent value="embed" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Iframe Link</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyIframeLink}
                >
                  <CopyIcon className="h-4 w-4" />
                </Button>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <code className="text-sm break-all text-blue-600">
                  {iframeLink}
                </code>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Iframe Kodu</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyIframeCode}
                >
                  <CopyIcon className="h-4 w-4" />
                </Button>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <code className="text-sm break-all">{iframeCode}</code>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
