'use client';

import { useEffect, useState } from 'react';
import { sendSms } from '@/services/marketing-sms-service';
import { getSmsTemplates } from '@/services/sms-template-service';
import { Loader2, MessageSquare } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { type SmsTemplate } from '@/features/sms-templates/data/schema';
import { type Customer } from '../data/schema';

type CustomersSmsTabProps = {
  customer: Customer;
  onSuccess?: () => void;
};

export function CustomersSmsTab({ customer, onSuccess }: CustomersSmsTabProps) {
  const [templates, setTemplates] = useState<SmsTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<SmsTemplate | null>(
    null
  );
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  useEffect(() => {
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
  }, []);

  const handleSend = async () => {
    if (!customer.phone) {
      toast.error('Müşterinin telefon numarası bulunmuyor.');
      return;
    }

    if (!selectedTemplate && !customMessage) {
      toast.error('Lütfen bir şablon seçin veya mesaj yazın.');
      return;
    }

    setIsSending(true);

    try {
      const payload: Record<string, unknown> = {
        customer_id: customer.id,
      };

      if (selectedTemplate) {
        payload.sms_template_id = selectedTemplate.id;
      } else {
        payload.message = customMessage;
      }

      await sendSms(payload);

      toast.success('SMS başarıyla gönderildi.');

      setSelectedTemplate(null);
      setCustomMessage('');

      onSuccess?.();
    } catch {
      toast.error('SMS gönderilirken bir hata oluştu.');
    } finally {
      setIsSending(false);
    }
  };

  if (!customer.phone) {
    return (
      <div className="border-muted flex flex-col items-center justify-center rounded-md border p-8">
        <MessageSquare className="text-muted-foreground mb-2 h-8 w-8" />
        <p className="text-muted-foreground text-sm">
          Bu müşterinin telefon numarası bulunmuyor.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Telefon Numarası</Label>
        <div className="bg-muted rounded-md p-3">
          <p className="text-sm font-medium">{customer.phone}</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label>SMS Şablonu (Opsiyonel)</Label>
        <Select
          value={selectedTemplate?.id.toString() || ''}
          onValueChange={(value) => {
            if (value === 'none') {
              setSelectedTemplate(null);
            } else {
              const template = templates.find((t) => t.id.toString() === value);
              setSelectedTemplate(template || null);
              if (template) {
                setCustomMessage('');
              }
            }
          }}
          disabled={isLoadingTemplates}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Şablon seçin veya özel mesaj yazın" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Şablon kullanma</SelectItem>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id.toString()}>
                {template.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedTemplate && (
        <div className="space-y-2">
          <Label>Özel Mesaj</Label>
          <Textarea
            placeholder="Mesajınızı buraya yazın..."
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            rows={4}
          />
        </div>
      )}

      {(selectedTemplate || customMessage) && (
        <div className="space-y-2">
          <Label>Önizleme</Label>
          <div className="bg-muted rounded-md p-4">
            <div className="flex max-w-md items-start gap-3">
              <div className="bg-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                <MessageSquare className="text-primary h-4 w-4" />
              </div>
              <div className="bg-background flex-1 space-y-2 rounded-lg p-3 shadow-sm">
                <p className="text-sm whitespace-pre-wrap">
                  {selectedTemplate?.message || customMessage}
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
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleSend}
          disabled={(!selectedTemplate && !customMessage) || isSending}
        >
          {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Gönder
        </Button>
      </div>
    </div>
  );
}
