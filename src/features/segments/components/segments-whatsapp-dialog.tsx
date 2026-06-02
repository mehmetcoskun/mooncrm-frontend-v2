'use client';

import { useEffect, useState } from 'react';
import { getCustomersBySegmentId } from '@/services/customer-service';
import {
  sendBulkFileScheduler,
  sendBulkImageScheduler,
  sendBulkTextScheduler,
} from '@/services/whatsapp-scheduler-service';
import { getWhatsappSessions } from '@/services/whatsapp-session-service';
import { getWhatsappTemplates } from '@/services/whatsapp-template-service';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  FileIcon,
  ImageIcon,
  Loader2,
  MessageSquare,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
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
import { type WhatsappSession } from '@/features/whatsapp-sessions/data/schema';
import { type WhatsappTemplate } from '@/features/whatsapp-templates/data/schema';
import { type Segment } from '../data/schema';

type SegmentsWhatsappDialogProps = {
  currentRow?: Segment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function SegmentsWhatsappDialog({
  currentRow,
  open,
  onOpenChange,
  onSuccess,
}: SegmentsWhatsappDialogProps) {
  const [sessions, setSessions] = useState<WhatsappSession[]>([]);
  const [selectedSession, setSelectedSession] =
    useState<WhatsappSession | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([]);
  const [templates, setTemplates] = useState<WhatsappTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<WhatsappTemplate | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{
    base64: string;
    type: string;
    name: string;
  } | null>(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [batchSize, setBatchSize] = useState(100);
  const [batchOffset, setBatchOffset] = useState(0);

  useEffect(() => {
    if (open) {
      setIsLoadingSessions(true);
      getWhatsappSessions()
        .then((data) => {
          const nonAdminSessions = data.filter(
            (session: WhatsappSession) => !session.is_admin
          );
          setSessions(nonAdminSessions);
        })
        .catch(() => {
          toast.error('Oturumlar yüklenirken bir hata oluştu.');
        })
        .finally(() => {
          setIsLoadingSessions(false);
        });

      setIsLoadingTemplates(true);
      getWhatsappTemplates()
        .then((data) => {
          setTemplates(data);
        })
        .catch(() => {
          toast.error('Şablonlar yüklenirken bir hata oluştu.');
        })
        .finally(() => {
          setIsLoadingTemplates(false);
        });
    }
  }, [open]);

  useEffect(() => {
    if (!selectedSession || !currentRow?.id) {
      setCustomers([]);
      setSelectedCustomers([]);
      return;
    }

    setIsLoadingCustomers(true);
    getCustomersBySegmentId(currentRow.id)
      .then((data) => {
        setCustomers(data);
        setSelectedCustomers([]);
      })
      .catch(() => {
        toast.error('Müşteriler yüklenirken bir hata oluştu.');
      })
      .finally(() => {
        setIsLoadingCustomers(false);
      });
  }, [selectedSession, currentRow?.id]);

  // Segment bazında kaldığın grup ofsetini localStorage'dan yükle.
  useEffect(() => {
    setSearchQuery('');
    if (!currentRow?.id) {
      setBatchOffset(0);
      return;
    }
    const saved = localStorage.getItem(
      `whatsapp_segment_offset_${currentRow.id}`
    );
    const parsed = saved ? parseInt(saved, 10) : 0;
    setBatchOffset(Number.isFinite(parsed) && parsed > 0 ? parsed : 0);
  }, [currentRow?.id]);

  // Telefon numarası olan müşteriler gönderilebilir. Numaranın WhatsApp'ta
  // kayıtlı olup olmadığı, gönderim sırasında scheduler tarafında kontrol edilir.
  const eligibleCustomers = customers.filter((customer) => customer.phone);

  // Arama kutusuna göre filtrelenmiş liste (yalnızca görüntüleme için).
  const filteredCustomers = searchQuery.trim()
    ? eligibleCustomers.filter((customer) => {
        const q = searchQuery.trim().toLowerCase();
        return (
          customer.name?.toLowerCase().includes(q) ||
          customer.phone?.toLowerCase().includes(q)
        );
      })
    : eligibleCustomers;

  const persistOffset = (offset: number) => {
    if (currentRow?.id) {
      localStorage.setItem(
        `whatsapp_segment_offset_${currentRow.id}`,
        String(offset)
      );
    }
  };

  // Grup seçimleri tam (ofset bazlı) liste üzerinde çalışır, aramadan bağımsızdır.
  const selectBatchAt = (offset: number) => {
    setSelectedCustomers(eligibleCustomers.slice(offset, offset + batchSize));
  };

  const handleSelectCurrentBatch = () => {
    selectBatchAt(batchOffset);
  };

  const handleNextBatch = () => {
    const next = batchOffset + batchSize;
    if (next >= eligibleCustomers.length) {
      toast.info('Son gruba ulaşıldı.');
      return;
    }
    setBatchOffset(next);
    persistOffset(next);
    selectBatchAt(next);
  };

  const handlePrevBatch = () => {
    const prev = Math.max(0, batchOffset - batchSize);
    setBatchOffset(prev);
    persistOffset(prev);
    selectBatchAt(prev);
  };

  const handleResetBatch = () => {
    setBatchOffset(0);
    persistOffset(0);
    setSelectedCustomers([]);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10485760) {
      toast.error("Dosya boyutu 10MB'dan büyük olamaz.");
      return;
    }

    const validTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/pdf',
    ];
    if (!validTypes.includes(file.type)) {
      toast.error('Sadece resim (JPEG, PNG) ve PDF dosyaları yüklenebilir.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64WithPrefix = reader.result as string;
      const base64 = base64WithPrefix.split(',')[1];
      setUploadedFile({
        base64,
        type: file.type,
        name: file.name,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSelectAll = () => {
    const selectableCount = Math.min(eligibleCustomers.length, 256);
    if (selectedCustomers.length === selectableCount) {
      setSelectedCustomers([]);
    } else {
      const customersToSelect = eligibleCustomers.slice(0, 256);
      if (eligibleCustomers.length > 256) {
        toast.warning(
          `Maksimum 256 müşteri seçilebilir. İlk 256 müşteri seçildi.`
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
      !selectedSession ||
      !selectedTemplate ||
      selectedCustomers.length === 0
    ) {
      toast.error('Lütfen tüm alanları doldurun ve en az bir müşteri seçin.');
      return;
    }

    setIsSending(true);

    try {
      const formattedCustomers = selectedCustomers.map((customer) => ({
        user: customer.user.name,
        name: customer.name,
        chatId:
          customer.phone.replace(/\D/g, '').replace(/^(\+)|^0/g, '') + '@c.us',
      }));

      const interval = 90;

      let response;
      if (uploadedFile) {
        if (uploadedFile.type.startsWith('image/')) {
          response = await sendBulkImageScheduler({
            customers: formattedCustomers,
            text: selectedTemplate.message,
            image: uploadedFile.base64,
            session: selectedSession,
            interval,
          });
        } else {
          response = await sendBulkFileScheduler({
            customers: formattedCustomers,
            text: selectedTemplate.message,
            file: uploadedFile.base64,
            session: selectedSession,
            interval,
          });
        }
      } else {
        response = await sendBulkTextScheduler({
          customers: formattedCustomers,
          text: selectedTemplate.message,
          session: selectedSession,
          interval,
        });
      }

      const campaignKey = response?.data?.key || response?.data;
      if (campaignKey) {
        const storageKey = 'whatsapp_campaign_keys';
        const existingKeys = JSON.parse(
          localStorage.getItem(storageKey) || '[]'
        );
        const campaignData = {
          key: campaignKey,
          createdAt: new Date().toISOString(),
          totalCustomers: selectedCustomers.length,
        };
        const updatedKeys = [campaignData, ...existingKeys];
        localStorage.setItem(storageKey, JSON.stringify(updatedKeys));
      }

      toast.success(
        `${selectedCustomers.length} müşteriye WhatsApp mesajı gönderilmeye başlandı.`
      );

      setSelectedSession(null);
      setSelectedTemplate(null);
      setUploadedFile(null);
      setSelectedCustomers([]);
      setCustomers([]);

      onSuccess?.();
      onOpenChange(false);
    } catch {
      toast.error('Mesajlar gönderilirken bir hata oluştu.');
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
          <SheetTitle>WhatsApp Kampanyası Oluştur</SheetTitle>
          <SheetDescription>
            {currentRow?.title} segmentine ait WhatsApp kampanyasını oluşturun.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 px-6 py-4">
            <div className="space-y-2">
              <Label>WhatsApp Oturumu</Label>
              <Select
                value={selectedSession?.id.toString()}
                onValueChange={(value) => {
                  const session = sessions.find(
                    (s) => s.id.toString() === value
                  );
                  setSelectedSession(session || null);
                }}
                disabled={isLoadingSessions}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Bir oturum seçin" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((session) => (
                    <SelectItem key={session.id} value={session.id.toString()}>
                      {session.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className={!selectedSession ? 'opacity-50' : ''}>
                  Müşteriler (Maksimum 256)
                </Label>
                {eligibleCustomers.length > 0 && (
                  <Badge variant="secondary">
                    {selectedCustomers.length} /{' '}
                    {Math.min(eligibleCustomers.length, 256)} seçili
                  </Badge>
                )}
              </div>

              {!selectedSession ? (
                <div className="border-muted bg-muted/30 flex flex-col items-center justify-center rounded-md border p-8 opacity-50">
                  <MessageSquare className="text-muted-foreground mb-2 h-8 w-8" />
                  <p className="text-muted-foreground text-sm">
                    Müşterileri görmek için önce bir oturum seçin.
                  </p>
                </div>
              ) : isLoadingCustomers ? (
                <div className="border-muted flex items-center justify-center rounded-md border p-8">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="text-muted-foreground text-sm">
                    Müşteriler yükleniyor...
                  </span>
                </div>
              ) : eligibleCustomers.length === 0 ? (
                <div className="border-muted flex flex-col items-center justify-center rounded-md border p-8">
                  <MessageSquare className="text-muted-foreground mb-2 h-8 w-8" />
                  <p className="text-muted-foreground text-sm">
                    Bu segmentte gönderilebilecek müşteri bulunamadı.
                  </p>
                </div>
              ) : (
                <div className="border-muted space-y-2 rounded-md border">
                  <div className="space-y-2 border-b p-2">
                    <div className="relative">
                      <Search className="text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2" />
                      <Input
                        placeholder="İsim veya telefon ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-muted-foreground text-xs">
                        Grup boyutu:
                      </span>
                      <Select
                        value={String(batchSize)}
                        onValueChange={(value) => setBatchSize(Number(value))}
                      >
                        <SelectTrigger className="h-8 w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[10, 25, 50, 100, 256].map((n) => (
                            <SelectItem key={n} value={String(n)}>
                              {n}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSelectCurrentBatch}
                      >
                        Grubu Seç
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevBatch}
                        disabled={batchOffset <= 0}
                      >
                        <ChevronLeft className="h-4 w-4" /> Önceki
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextBatch}
                        disabled={
                          batchOffset + batchSize >= eligibleCustomers.length
                        }
                      >
                        Sonraki <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleResetBatch}
                      >
                        Sıfırla
                      </Button>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      Grup: {Math.min(batchOffset + 1, eligibleCustomers.length)}
                      –
                      {Math.min(
                        batchOffset + batchSize,
                        eligibleCustomers.length
                      )}{' '}
                      / {eligibleCustomers.length} müşteri (kaldığın yer
                      kaydedilir)
                    </p>
                  </div>
                  <div className="border-muted flex items-center gap-2 border-b p-3">
                    <Checkbox
                      checked={
                        selectedCustomers.length ===
                        Math.min(eligibleCustomers.length, 256)
                      }
                      onCheckedChange={handleSelectAll}
                    />
                    <Label className="cursor-pointer" onClick={handleSelectAll}>
                      Tümünü Seç{' '}
                      {eligibleCustomers.length > 256 && '(İlk 256)'}
                    </Label>
                  </div>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-1 p-2">
                      {filteredCustomers.length === 0 ? (
                        <p className="text-muted-foreground p-4 text-center text-sm">
                          Aramayla eşleşen müşteri yok.
                        </p>
                      ) : (
                        filteredCustomers.map((customer) => (
                        <div
                          key={customer.id}
                          className="hover:bg-muted flex cursor-pointer items-center gap-2 rounded-md p-2 transition-colors"
                          onClick={() => handleCustomerToggle(customer)}
                        >
                          <Checkbox
                            checked={selectedCustomers.some(
                              (c) => c.id === customer.id
                            )}
                            onCheckedChange={() =>
                              handleCustomerToggle(customer)
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
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label
                className={
                  !selectedSession || eligibleCustomers.length === 0
                    ? 'opacity-50'
                    : ''
                }
              >
                WhatsApp Şablonu
              </Label>
              <Select
                value={selectedTemplate?.id.toString()}
                onValueChange={(value) => {
                  const template = templates.find(
                    (t) => t.id.toString() === value
                  );
                  setSelectedTemplate(template || null);
                }}
                disabled={
                  isLoadingTemplates ||
                  !selectedSession ||
                  eligibleCustomers.length === 0
                }
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

            <div className="space-y-2">
              <Label className={!selectedTemplate ? 'opacity-50' : ''}>
                Dosya/Resim Ekle (Opsiyonel)
              </Label>
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  onChange={handleFileUpload}
                  disabled={!selectedTemplate}
                />
                {uploadedFile && (
                  <div className="bg-muted flex items-center gap-2 rounded-md p-2">
                    {uploadedFile.type.startsWith('image/') ? (
                      <ImageIcon className="h-4 w-4" />
                    ) : (
                      <FileIcon className="h-4 w-4" />
                    )}
                    <span className="text-sm">{uploadedFile.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUploadedFile(null)}
                      className="ml-auto"
                    >
                      Kaldır
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div
              className={`rounded-md p-3 ${selectedTemplate ? 'bg-muted' : 'bg-muted/30 opacity-50'}`}
            >
              <p className="text-muted-foreground text-sm">
                <strong>Mesaj Gönderme Aralığı:</strong> 90 saniye
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                Mesajlar her müşteriye 90 saniye aralıklarla gönderilecektir.
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                WhatsApp'ta kayıtlı olmayan numaralar gönderim sırasında otomatik
                olarak atlanır.
              </p>
            </div>

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
                      {uploadedFile &&
                        uploadedFile.type.startsWith('image/') && (
                          <img
                            src={`data:${uploadedFile.type};base64,${uploadedFile.base64}`}
                            alt="Preview"
                            className="h-auto w-full rounded-md"
                          />
                        )}
                      {uploadedFile &&
                        !uploadedFile.type.startsWith('image/') && (
                          <div className="bg-muted flex items-center gap-2 rounded-md p-2">
                            <FileIcon className="h-4 w-4" />
                            <span className="text-sm">{uploadedFile.name}</span>
                          </div>
                        )}
                      <p className="text-sm whitespace-pre-wrap">
                        {selectedTemplate.message}
                      </p>
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-muted-foreground text-xs">
                          {new Date().toLocaleTimeString('tr-TR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <Check className="text-primary h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t px-6 py-4">
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button
              onClick={handleSend}
              disabled={
                !selectedSession ||
                !selectedTemplate ||
                selectedCustomers.length === 0 ||
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
