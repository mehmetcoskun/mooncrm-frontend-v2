'use client';

import { useEffect, useState } from 'react';
import {
  callPhone,
  getVapiAssistants,
  getVapiPhoneNumbers,
} from '@/services/vapi-service';
import { Loader2, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type Customer } from '../data/schema';

type CustomersPhoneTabProps = {
  customer: Customer;
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

export function CustomersPhoneTab({
  customer,
  onSuccess,
}: CustomersPhoneTabProps) {
  const [assistants, setAssistants] = useState<VapiAssistant[]>([]);
  const [phoneNumbers, setPhoneNumbers] = useState<VapiPhoneNumber[]>([]);
  const [selectedAssistant, setSelectedAssistant] = useState<string | null>(
    null
  );
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<string | null>(
    null
  );
  const [isLoadingAssistants, setIsLoadingAssistants] = useState(false);
  const [isLoadingPhoneNumbers, setIsLoadingPhoneNumbers] = useState(false);
  const [isCalling, setIsCalling] = useState(false);

  useEffect(() => {
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
  }, []);

  const handleCall = async () => {
    if (!selectedAssistant || !selectedPhoneNumber || !customer.phone) {
      toast.error(
        'Lütfen asistan ve telefon numarası seçin ve müşterinin telefon numarası olduğundan emin olun.'
      );
      return;
    }

    setIsCalling(true);

    try {
      const payload = {
        assistantId: selectedAssistant,
        phoneNumberId: selectedPhoneNumber,
        customer: {
          number: customer.phone,
        },
        assistantOverrides: {
          variableValues: {
            id: customer.id,
            name: customer.name.split(' ')[0], // First name only
            user: customer.user.name,
            organization: customer.organization.name,
          },
        },
      };

      await callPhone(payload);

      toast.success('Arama başarıyla başlatıldı.');

      setSelectedAssistant(null);
      setSelectedPhoneNumber(null);

      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      toast.error(errorMessage || 'Arama başlatılırken bir hata oluştu.');
    } finally {
      setIsCalling(false);
    }
  };

  if (!customer.phone) {
    return (
      <div className="border-muted flex flex-col items-center justify-center rounded-md border p-8">
        <Phone className="text-muted-foreground mb-2 h-8 w-8" />
        <p className="text-muted-foreground text-sm">
          Bu müşterinin telefon numarası bulunmuyor.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Müşteri Bilgileri</Label>
        <div className="bg-muted space-y-2 rounded-md p-3">
          <div>
            <p className="text-muted-foreground text-xs">İsim:</p>
            <p className="text-sm font-medium">{customer.name}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Telefon:</p>
            <p className="text-sm font-medium">{customer.phone}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Danışman:</p>
            <p className="text-sm font-medium">{customer.user.name}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Organizasyon:</p>
            <p className="text-sm font-medium">{customer.organization.name}</p>
          </div>
        </div>
      </div>

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

      <div
        className={`rounded-md p-3 ${selectedAssistant && selectedPhoneNumber ? 'bg-muted' : 'bg-muted/30 opacity-50'}`}
      >
        <p className="text-muted-foreground text-sm">
          <strong>Arama Bilgisi:</strong>
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          Seçilen asistan ve telefon numarası ile müşteri aranacaktır. Asistan,
          müşteri bilgilerine (ID, isim, danışman, organizasyon)
          erişebilecektir.
        </p>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleCall}
          disabled={!selectedAssistant || !selectedPhoneNumber || isCalling}
        >
          {isCalling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Aramayı Başlat
        </Button>
      </div>
    </div>
  );
}
