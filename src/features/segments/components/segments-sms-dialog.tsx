'use client';

import { useEffect, useState } from 'react';
import { getCustomersBySegmentId } from '@/services/customer-service';
import { bulkSendSms } from '@/services/marketing-sms-service';
import { getSmsTemplates } from '@/services/sms-template-service';
import { Loader2, MessageSquare } from 'lucide-react';
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
import { type SmsTemplate } from '@/features/sms-templates/data/schema';
import { type Segment } from '../data/schema';

type SegmentsSmsDialogProps = {
  currentRow?: Segment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function SegmentsSmsDialog({
  currentRow,
  open,
  onOpenChange,
  onSuccess,
}: SegmentsSmsDialogProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([]);
  const [templates, setTemplates] = useState<SmsTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<SmsTemplate | null>(
    null
  );
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (open) {
      setIsLoadingTemplates(true);
      getSmsTemplates()
        .then((data) => {
          setTemplates(data);
        })
        .catch(() => {
          toast.error('Şablonlar yüklenirken bir hata oluştu.');
        })
        .finally(() => {
          setIsLoadingTemplates(false);
        });

      if (currentRow?.id) {
        setIsLoadingCustomers(true);
        getCustomersBySegmentId(currentRow.id)
          .then((data) => {
            const customersWithPhone = data.filter((c: Customer) => c.phone);
            setCustomers(customersWithPhone);
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
      !currentRow?.id
    ) {
      toast.error('Lütfen şablon seçin ve en az bir müşteri seçin.');
      return;
    }

    setIsSending(true);

    try {
      const response = await bulkSendSms({
        segment_id: currentRow.id,
        sms_template_id: selectedTemplate.id,
      });

      toast.success(
        `Toplam ${response.total_count} SMS'den ${response.success_count} adedi başarıyla gönderildi${
          response.fail_count > 0
            ? `, ${response.fail_count} adedi başarısız oldu`
            : ''
        }.`
      );

      setSelectedTemplate(null);
      setSelectedCustomers([]);
      setCustomers([]);

      onSuccess?.();
      onOpenChange(false);
    } catch {
      toast.error("SMS'ler gönderilirken bir hata oluştu.");
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
          <SheetTitle>SMS Kampanyası Oluştur</SheetTitle>
          <SheetDescription>
            {currentRow?.title} segmentine ait SMS kampanyasını oluşturun.
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
                  <MessageSquare className="text-muted-foreground mb-2 h-8 w-8" />
                  <p className="text-muted-foreground text-sm">
                    Bu segmentte telefon numarası olan müşteri bulunamadı.
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
                              {customer.phone}
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
                SMS Şablonu
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

            {/* Preview */}
            <div className="space-y-2">
              <Label className={!selectedTemplate ? 'opacity-50' : ''}>
                Önizleme
              </Label>
              {!selectedTemplate ? (
                <div className="border-muted bg-muted/30 flex flex-col items-center justify-center rounded-md border p-8 opacity-50">
                  <MessageSquare className="text-muted-foreground mb-2 h-8 w-8" />
                  <p className="text-muted-foreground text-sm">
                    Önizleme için bir şablon seçin.
                  </p>
                </div>
              ) : (
                <div className="bg-muted rounded-md p-4">
                  <div className="flex max-w-md items-start gap-3">
                    <div className="bg-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                      <MessageSquare className="text-primary h-4 w-4" />
                    </div>
                    <div className="bg-background flex-1 space-y-2 rounded-lg p-3 shadow-sm">
                      <p className="text-sm whitespace-pre-wrap">
                        {selectedTemplate.message}
                      </p>
                      <div className="flex items-center justify-end">
                        <span className="text-muted-foreground text-xs">
                          {new Date().toLocaleTimeString('tr-TR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
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
                !selectedTemplate || selectedCustomers.length === 0 || isSending
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
