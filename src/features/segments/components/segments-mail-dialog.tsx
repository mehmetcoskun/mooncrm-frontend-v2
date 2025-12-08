'use client';

import { useEffect, useState } from 'react';
import { getCustomersBySegmentId } from '@/services/customer-service';
import { getEmailTemplates } from '@/services/email-template-service';
import { sendBulkEmailScheduler } from '@/services/mail-scheduler-service';
import { getSetting } from '@/services/setting-service';
import { Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { type Customer } from '@/features/customers/data/schema';
import { type EmailTemplate } from '@/features/email-templates/data/schema';
import { type Segment } from '../data/schema';

type SegmentsMailDialogProps = {
  currentRow?: Segment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function SegmentsMailDialog({
  currentRow,
  open,
  onOpenChange,
  onSuccess,
}: SegmentsMailDialogProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<EmailTemplate | null>(null);
  const [settings, setSettings] = useState<{
    mail_settings?: {
      smtp_host?: string;
      smtp_port?: string;
      smtp_username?: string;
      smtp_password?: string;
      smtp_from_name?: string;
    };
  } | null>(null);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Load templates, settings and customers
  useEffect(() => {
    if (open) {
      setIsLoadingTemplates(true);
      getEmailTemplates()
        .then((data) => {
          setTemplates(data);
        })
        .catch(() => {
          toast.error('Şablonlar yüklenirken bir hata oluştu.');
        })
        .finally(() => {
          setIsLoadingTemplates(false);
        });

      setIsLoadingSettings(true);
      getSetting()
        .then((data) => {
          setSettings(data);
          if (!data?.mail_settings?.smtp_host) {
            toast.error(
              'E-posta ayarları bulunamadı. Lütfen sistem ayarlarını kontrol edin.'
            );
          }
        })
        .catch(() => {
          toast.error('Ayarlar yüklenirken bir hata oluştu.');
        })
        .finally(() => {
          setIsLoadingSettings(false);
        });

      if (currentRow?.id) {
        setIsLoadingCustomers(true);
        getCustomersBySegmentId(currentRow.id)
          .then((data) => {
            // Filter customers with email
            const customersWithEmail = data.filter((c: Customer) => c.email);
            setCustomers(customersWithEmail);
          })
          .catch(() => {
            toast.error('Müşteriler yüklenirken bir hata oluştu.');
          })
          .finally(() => {
            setIsLoadingCustomers(false);
          });
      }
    }
  }, [open, currentRow?.id]);

  const handleSelectAll = () => {
    if (selectedCustomers.length === Math.min(customers.length, 256)) {
      setSelectedCustomers([]);
    } else {
      const customersToSelect = customers.slice(0, 256);
      if (customers.length > 256) {
        toast.warning(
          'Maksimum 256 müşteri seçilebilir. İlk 256 müşteri seçildi.'
        );
      }
      setSelectedCustomers(customersToSelect);
    }
  };

  const handleCustomerToggle = (customer: Customer) => {
    const isSelected = selectedCustomers.some((c) => c.id === customer.id);
    if (isSelected) {
      setSelectedCustomers(
        selectedCustomers.filter((c) => c.id !== customer.id)
      );
    } else {
      if (selectedCustomers.length >= 256) {
        toast.error('Maksimum 256 müşteri seçebilirsiniz.');
        return;
      }
      setSelectedCustomers([...selectedCustomers, customer]);
    }
  };

  const handleSend = async () => {
    if (
      !selectedTemplate ||
      selectedCustomers.length === 0 ||
      !settings?.mail_settings?.smtp_host
    ) {
      toast.error(
        'Lütfen şablon seçin, müşteri seçin ve e-posta ayarlarının yapıldığından emin olun.'
      );
      return;
    }

    setIsSending(true);

    try {
      const formattedCustomers = selectedCustomers.map((customer) => ({
        name: customer.name,
        email: customer.email,
      }));

      const response = await sendBulkEmailScheduler({
        customers: formattedCustomers,
        subject: selectedTemplate.subject,
        body: selectedTemplate.html,
        interval: 90,
        smtpConfig: {
          smtp_host: settings.mail_settings.smtp_host,
          smtp_port: parseInt(settings.mail_settings.smtp_port || '587'),
          smtp_username: settings.mail_settings.smtp_username,
          smtp_password: settings.mail_settings.smtp_password,
          smtp_from_name: settings.mail_settings.smtp_from_name,
        },
      });

      const campaignKey = response?.data?.key || response?.data;
      if (campaignKey) {
        const storageKey = 'email_campaign_keys';
        const existingKeys = JSON.parse(
          localStorage.getItem(storageKey) || '[]'
        );
        const campaignData = {
          key: campaignKey,
          createdAt: new Date().toISOString(),
          totalCustomers: formattedCustomers.length,
        };
        const updatedKeys = [campaignData, ...existingKeys];
        localStorage.setItem(storageKey, JSON.stringify(updatedKeys));
      }

      toast.success(
        `${formattedCustomers.length} adet e-posta gönderilmeye başlandı.`
      );

      // Reset form
      setSelectedTemplate(null);
      setSelectedCustomers([]);
      setCustomers([]);

      onSuccess?.();
      onOpenChange(false);
    } catch {
      toast.error('E-postalar gönderilirken bir hata oluştu.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full max-w-full flex-col gap-0 p-0 sm:max-w-full"
      >
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle>E-posta Kampanyası Oluştur</SheetTitle>
          <SheetDescription>
            {currentRow?.title} segmentine ait e-posta kampanyasını oluşturun.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 px-6 py-4">
            {/* Customer Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Müşteriler (Maksimum 256)</Label>
                {customers.length > 0 && (
                  <Badge variant="secondary">
                    {selectedCustomers.length} /{' '}
                    {Math.min(customers.length, 256)} seçili
                  </Badge>
                )}
              </div>

              {isLoadingCustomers ? (
                <div className="border-muted flex items-center justify-center rounded-md border p-8">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="text-muted-foreground text-sm">
                    Müşteriler yükleniyor...
                  </span>
                </div>
              ) : customers.length === 0 ? (
                <div className="border-muted flex flex-col items-center justify-center rounded-md border p-8">
                  <Mail className="text-muted-foreground mb-2 h-8 w-8" />
                  <p className="text-muted-foreground text-sm">
                    Bu segmentte e-posta adresi olan müşteri bulunamadı.
                  </p>
                </div>
              ) : (
                <div className="border-muted space-y-2 rounded-md border">
                  <div className="border-muted flex items-center gap-2 border-b p-3">
                    <Checkbox
                      checked={
                        selectedCustomers.length ===
                        Math.min(customers.length, 256)
                      }
                      onCheckedChange={handleSelectAll}
                    />
                    <Label className="cursor-pointer" onClick={handleSelectAll}>
                      Tümünü Seç {customers.length > 256 && '(İlk 256)'}
                    </Label>
                  </div>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-1 p-2">
                      {customers.map((customer, index) => (
                        <div
                          key={customer.id}
                          className={`flex items-center gap-2 rounded-md p-2 transition-colors ${
                            index >= 256
                              ? 'cursor-not-allowed opacity-50'
                              : 'hover:bg-muted cursor-pointer'
                          }`}
                          onClick={() => {
                            if (
                              index < 256 ||
                              selectedCustomers.some(
                                (c) => c.id === customer.id
                              )
                            ) {
                              handleCustomerToggle(customer);
                            }
                          }}
                        >
                          <Checkbox
                            checked={selectedCustomers.some(
                              (c) => c.id === customer.id
                            )}
                            onCheckedChange={() =>
                              handleCustomerToggle(customer)
                            }
                            disabled={
                              index >= 256 &&
                              !selectedCustomers.some(
                                (c) => c.id === customer.id
                              )
                            }
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {customer.name}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {customer.email}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>

            {/* Template Selection */}
            <div className="space-y-2">
              <Label className={customers.length === 0 ? 'opacity-50' : ''}>
                E-posta Şablonu
              </Label>
              <Select
                value={selectedTemplate?.id.toString()}
                onValueChange={(value) => {
                  const template = templates.find(
                    (t) => t.id.toString() === value
                  );
                  setSelectedTemplate(template || null);
                }}
                disabled={isLoadingTemplates || customers.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Bir şablon seçin" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem
                      key={template.id}
                      value={template.id.toString()}
                    >
                      {template.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Interval Info */}
            <div
              className={`rounded-md p-3 ${selectedTemplate ? 'bg-muted' : 'bg-muted/30 opacity-50'}`}
            >
              <p className="text-muted-foreground text-sm">
                <strong>E-posta Gönderme Aralığı:</strong> 90 saniye
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                E-postalar her müşteriye 90 saniye aralıklarla gönderilecektir.
              </p>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label className={!selectedTemplate ? 'opacity-50' : ''}>
                Önizleme
              </Label>
              {!selectedTemplate ? (
                <div className="border-muted bg-muted/30 flex flex-col items-center justify-center rounded-md border p-8 opacity-50">
                  <Mail className="text-muted-foreground mb-2 h-8 w-8" />
                  <p className="text-muted-foreground text-sm">
                    Önizleme için bir şablon seçin.
                  </p>
                </div>
              ) : (
                <div className="bg-muted rounded-md p-4">
                  <div className="bg-background space-y-3 rounded-lg p-4 shadow-sm">
                    <div className="border-muted border-b pb-3">
                      <p className="text-muted-foreground text-xs">Konu:</p>
                      <p className="text-sm font-medium">
                        {selectedTemplate.subject}
                      </p>
                    </div>
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: selectedTemplate.html || '',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Settings Warning */}
            {!isLoadingSettings && !settings?.mail_settings?.smtp_host && (
              <div className="bg-destructive/10 border-destructive rounded-md border p-3">
                <p className="text-destructive text-sm">
                  <strong>Uyarı:</strong> E-posta ayarları yapılmamış. Lütfen
                  sistem ayarlarından SMTP bilgilerini girin.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t px-6 py-4">
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button
              onClick={handleSend}
              disabled={
                !selectedTemplate ||
                selectedCustomers.length === 0 ||
                !settings?.mail_settings?.smtp_host ||
                isSending
              }
            >
              {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Gönder
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
