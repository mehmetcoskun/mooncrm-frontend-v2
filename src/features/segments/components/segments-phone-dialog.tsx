'use client';

import { useEffect, useState } from 'react';
import { getCustomersBySegmentId } from '@/services/customer-service';
import {
  call,
  getVapiAssistants,
  getVapiPhoneNumbers,
} from '@/services/vapi-service';
import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';
import { Loader2, Phone } from 'lucide-react';
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
import { type Segment } from '../data/schema';

type SegmentsPhoneDialogProps = {
  currentRow?: Segment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

type VapiAssistant = {
  id: string;
  name: string;
};

type VapiPhoneNumber = {
  id: string;
  name: string;
};

const phoneUtil = PhoneNumberUtil.getInstance();

const isPhoneValidE164 = (phone: string): boolean => {
  try {
    const phoneNumber = phoneUtil.parseAndKeepRawInput(phone);
    return phoneUtil.isValidNumber(phoneNumber);
  } catch {
    return false;
  }
};

export function SegmentsPhoneDialog({
  currentRow,
  open,
  onOpenChange,
  onSuccess,
}: SegmentsPhoneDialogProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [validatedCustomers, setValidatedCustomers] = useState<Customer[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([]);
  const [assistants, setAssistants] = useState<VapiAssistant[]>([]);
  const [phoneNumbers, setPhoneNumbers] = useState<VapiPhoneNumber[]>([]);
  const [selectedAssistant, setSelectedAssistant] = useState<string | null>(
    null
  );
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isLoadingAssistants, setIsLoadingAssistants] = useState(false);
  const [isLoadingPhoneNumbers, setIsLoadingPhoneNumbers] = useState(false);
  const [isCalling, setIsCalling] = useState(false);

  // Load assistants and phone numbers
  useEffect(() => {
    if (open) {
      setIsLoadingAssistants(true);
      getVapiAssistants()
        .then((data) => {
          setAssistants(data);
        })
        .catch(() => {
          toast.error('Asistanlar yüklenirken bir hata oluştu.');
        })
        .finally(() => {
          setIsLoadingAssistants(false);
        });

      setIsLoadingPhoneNumbers(true);
      getVapiPhoneNumbers()
        .then((data) => {
          setPhoneNumbers(data);
        })
        .catch(() => {
          toast.error('Telefon numaraları yüklenirken bir hata oluştu.');
        })
        .finally(() => {
          setIsLoadingPhoneNumbers(false);
        });

      if (currentRow?.id) {
        setIsLoadingCustomers(true);
        getCustomersBySegmentId(currentRow.id)
          .then((data) => {
            setCustomers(data);
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

  // Validate customers for E164 format
  useEffect(() => {
    if (customers.length === 0) {
      setValidatedCustomers([]);
      return;
    }

    const validateCustomers = async () => {
      setIsValidating(true);
      const validated: Customer[] = [];

      for (const customer of customers) {
        if (!customer.phone) continue;

        if (isPhoneValidE164(customer.phone)) {
          validated.push(customer);
        }
      }

      setValidatedCustomers(validated);
      setIsValidating(false);
    };

    validateCustomers();
  }, [customers]);

  const handleSelectAll = () => {
    if (selectedCustomers.length === Math.min(validatedCustomers.length, 100)) {
      setSelectedCustomers([]);
    } else {
      const customersToSelect = validatedCustomers.slice(0, 100);
      if (validatedCustomers.length > 100) {
        toast.warning(
          'Maksimum 100 müşteri seçilebilir. İlk 100 müşteri seçildi.'
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
      if (selectedCustomers.length >= 100) {
        toast.error('Maksimum 100 müşteri seçebilirsiniz.');
        return;
      }
      setSelectedCustomers([...selectedCustomers, customer]);
    }
  };

  const handleCall = async () => {
    if (
      !selectedAssistant ||
      !selectedPhoneNumber ||
      selectedCustomers.length === 0
    ) {
      toast.error(
        'Lütfen asistan, telefon numarası seçin ve en az bir müşteri seçin.'
      );
      return;
    }

    setIsCalling(true);

    try {
      const formattedCustomers = selectedCustomers.map((customer) => {
        const phoneNumber = phoneUtil.parseAndKeepRawInput(customer.phone);
        const formattedPhone = phoneUtil.format(
          phoneNumber,
          PhoneNumberFormat.E164
        );
        return {
          number: formattedPhone,
          assistantOverrides: {
            variableValues: {
              id: customer.id,
              name: customer.name.split(' ')[0],
              user: customer.user.name,
              organization: customer.organization.name,
            },
          },
        };
      });

      const callPayload = {
        assistantId: selectedAssistant,
        phoneNumberId: selectedPhoneNumber,
        customers: formattedCustomers,
      };

      await call(callPayload);

      toast.success(
        `${selectedCustomers.length} müşteri için arama başlatıldı.`
      );

      // Reset form
      setSelectedAssistant(null);
      setSelectedPhoneNumber(null);
      setSelectedCustomers([]);
      setValidatedCustomers([]);
      setCustomers([]);

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      toast.error(errorMessage || 'Aramalar başlatılırken hata oluştu.');
    } finally {
      setIsCalling(false);
    }
  };

  const filteredCustomers = validatedCustomers.filter(
    (customer) =>
      customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.includes(searchQuery)
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full max-w-full flex-col gap-0 p-0 sm:max-w-full"
      >
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle>Telefon Araması Kampanyası Oluştur</SheetTitle>
          <SheetDescription>
            {currentRow?.title} segmentine ait telefon araması kampanyasını
            oluşturun.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 px-6 py-4">
            {/* Assistant Selection */}
            <div className="space-y-2">
              <Label>Asistan</Label>
              <Select
                value={selectedAssistant || undefined}
                onValueChange={(value) => setSelectedAssistant(value)}
                disabled={isLoadingAssistants}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Bir asistan seçin" />
                </SelectTrigger>
                <SelectContent>
                  {assistants.map((assistant) => (
                    <SelectItem key={assistant.id} value={assistant.id}>
                      {assistant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Phone Number Selection */}
            <div className="space-y-2">
              <Label className={!selectedAssistant ? 'opacity-50' : ''}>
                Telefon Numarası
              </Label>
              <Select
                value={selectedPhoneNumber || undefined}
                onValueChange={(value) => setSelectedPhoneNumber(value)}
                disabled={isLoadingPhoneNumbers || !selectedAssistant}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Bir telefon numarası seçin" />
                </SelectTrigger>
                <SelectContent>
                  {phoneNumbers.map((phoneNumber) => (
                    <SelectItem key={phoneNumber.id} value={phoneNumber.id}>
                      {phoneNumber.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Customer Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className={!selectedPhoneNumber ? 'opacity-50' : ''}>
                  Müşteriler (Maksimum 100)
                </Label>
                {validatedCustomers.length > 0 && (
                  <Badge variant="secondary">
                    {selectedCustomers.length} /{' '}
                    {Math.min(validatedCustomers.length, 100)} seçili
                  </Badge>
                )}
              </div>

              {!selectedPhoneNumber ? (
                <div className="border-muted bg-muted/30 flex flex-col items-center justify-center rounded-md border p-8 opacity-50">
                  <Phone className="text-muted-foreground mb-2 h-8 w-8" />
                  <p className="text-muted-foreground text-sm">
                    Müşterileri görmek için önce asistan ve telefon numarası
                    seçin.
                  </p>
                </div>
              ) : isLoadingCustomers || isValidating ? (
                <div className="border-muted flex items-center justify-center rounded-md border p-8">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="text-muted-foreground text-sm">
                    {isLoadingCustomers
                      ? 'Müşteriler yükleniyor...'
                      : 'Telefon numaraları kontrol ediliyor...'}
                  </span>
                </div>
              ) : validatedCustomers.length === 0 ? (
                <div className="border-muted flex flex-col items-center justify-center rounded-md border p-8">
                  <Phone className="text-muted-foreground mb-2 h-8 w-8" />
                  <p className="text-muted-foreground text-sm">
                    Bu segmentte geçerli telefon numarası olan müşteri
                    bulunamadı.
                  </p>
                </div>
              ) : (
                <div className="border-muted space-y-2 rounded-md border">
                  <div className="border-muted flex items-center gap-2 border-b p-3">
                    <Checkbox
                      checked={
                        selectedCustomers.length ===
                        Math.min(validatedCustomers.length, 100)
                      }
                      onCheckedChange={handleSelectAll}
                    />
                    <Label className="cursor-pointer" onClick={handleSelectAll}>
                      Tümünü Seç{' '}
                      {validatedCustomers.length > 100 && '(İlk 100)'}
                    </Label>
                  </div>
                  <div className="p-3">
                    <Input
                      placeholder="Müşteri adına göre arama yapın..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-1 p-2">
                      {filteredCustomers.map((customer, index) => (
                        <div
                          key={customer.id}
                          className={`flex items-center gap-2 rounded-md p-2 transition-colors ${
                            index >= 100
                              ? 'cursor-not-allowed opacity-50'
                              : 'hover:bg-muted cursor-pointer'
                          }`}
                          onClick={() => {
                            if (
                              index < 100 ||
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
                              index >= 100 &&
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
                            {customer.user && (
                              <p className="text-muted-foreground text-xs">
                                Danışman: {customer.user.name}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
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
              onClick={handleCall}
              disabled={
                !selectedAssistant ||
                !selectedPhoneNumber ||
                selectedCustomers.length === 0 ||
                isCalling
              }
            >
              {isCalling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Aramayı Başlat
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
