'use client';

import { useEffect, useState } from 'react';
import { getEmailTemplates } from '@/services/email-template-service';
import { sendEmail } from '@/services/marketing-email-service';
import { getSetting } from '@/services/setting-service';
import { Loader2, Mail, PaletteIcon } from 'lucide-react';
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
import { EmailEditorSheet } from '@/components/email-editor';
import { type EmailTemplate } from '@/features/email-templates/data/schema';
import { type Customer } from '../data/schema';

type CustomersEmailTabProps = {
  customer: Customer;
  onSuccess?: () => void;
};

export function CustomersEmailTab({
  customer,
  onSuccess,
}: CustomersEmailTabProps) {
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
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [customHtml, setCustomHtml] = useState('');
  const [customSubject, setCustomSubject] = useState('');

  useEffect(() => {
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
  }, []);

  const handleSend = async () => {
    if (!customer.email || !settings?.mail_settings?.smtp_host) {
      toast.error(
        'Müşterinin e-posta adresi olduğundan ve e-posta ayarlarının yapıldığından emin olun.'
      );
      return;
    }

    if (!selectedTemplate && !customHtml) {
      toast.error('Lütfen bir şablon seçin veya özel bir e-posta tasarlayın.');
      return;
    }

    setIsSending(true);

    try {
      const payload: Record<string, unknown> = {
        customer_id: customer.id,
      };

      if (selectedTemplate) {
        payload.email_template_id = selectedTemplate.id;
      } else {
        payload.subject = customSubject;
        payload.html = customHtml;
      }

      await sendEmail(payload);

      toast.success('E-posta başarıyla gönderildi.');

      setSelectedTemplate(null);
      setCustomHtml('');
      setCustomSubject('');

      onSuccess?.();
    } catch {
      toast.error('E-posta gönderilirken bir hata oluştu.');
    } finally {
      setIsSending(false);
    }
  };

  if (!customer.email) {
    return (
      <div className="border-muted flex flex-col items-center justify-center rounded-md border p-8">
        <Mail className="text-muted-foreground mb-2 h-8 w-8" />
        <p className="text-muted-foreground text-sm">
          Bu müşterinin e-posta adresi bulunmuyor.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>E-posta Adresi</Label>
        <div className="bg-muted rounded-md p-3">
          <p className="text-sm font-medium">{customer.email}</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label>E-posta Şablonu (Opsiyonel)</Label>
        <Select
          value={selectedTemplate?.id.toString() || ''}
          onValueChange={(value) => {
            if (value === 'none') {
              setSelectedTemplate(null);
              setCustomHtml('');
              setCustomSubject('');
            } else {
              const template = templates.find((t) => t.id.toString() === value);
              setSelectedTemplate(template || null);
              if (template) {
                setCustomHtml('');
                setCustomSubject('');
              }
            }
          }}
          disabled={isLoadingTemplates}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Şablon seçin veya özel tasarım yapın" />
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
        <>
          <div className="space-y-2">
            <Label>E-posta Konusu</Label>
            <Input
              placeholder="E-posta konusunu girin..."
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Özel E-posta Tasarımı</Label>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setEditorOpen(true)}
            >
              <PaletteIcon className="mr-2 h-4 w-4" />
              {customHtml
                ? 'E-Posta Tasarımını Düzenle'
                : 'E-Posta Tasarımı Oluştur'}
            </Button>
            {customHtml && (
              <div className="bg-muted rounded-md p-3">
                <p className="text-muted-foreground text-xs">✓ Tasarım hazır</p>
              </div>
            )}
          </div>
        </>
      )}

      {selectedTemplate && (
        <div className="space-y-2">
          <Label>Şablon Önizleme</Label>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              setCustomHtml(selectedTemplate.html || '');
              setCustomSubject(selectedTemplate.subject || '');
              setEditorOpen(true);
            }}
          >
            <PaletteIcon className="mr-2 h-4 w-4" />
            Şablonu Görüntüle / Düzenle
          </Button>
          <div className="bg-muted rounded-md p-3">
            <p className="text-muted-foreground text-xs">
              Konu: {selectedTemplate.subject}
            </p>
          </div>
        </div>
      )}

      {!isLoadingSettings && !settings?.mail_settings?.smtp_host && (
        <div className="bg-destructive/10 border-destructive rounded-md border p-3">
          <p className="text-destructive text-sm">
            <strong>Uyarı:</strong> E-posta ayarları yapılmamış. Lütfen sistem
            ayarlarından SMTP bilgilerini girin.
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleSend}
          disabled={
            (!selectedTemplate && (!customHtml || !customSubject)) ||
            !settings?.mail_settings?.smtp_host ||
            isSending
          }
        >
          {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Gönder
        </Button>
      </div>

      <EmailEditorSheet
        open={editorOpen}
        onOpenChange={setEditorOpen}
        initialTemplate={selectedTemplate?.template}
        onSave={(_template, html) => {
          setCustomHtml(html);
          setEditorOpen(false);
          toast.success('E-posta tasarımı kaydedildi.');
        }}
      />
    </div>
  );
}
