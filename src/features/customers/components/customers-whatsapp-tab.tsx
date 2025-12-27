'use client';

import { useEffect, useState } from 'react';
import {
  checkExists,
  sendFile,
  sendImage,
  sendText,
} from '@/services/whatsapp-service';
import { getWhatsappSessions } from '@/services/whatsapp-session-service';
import { getWhatsappTemplates } from '@/services/whatsapp-template-service';
import {
  Check,
  FileIcon,
  ImageIcon,
  Loader2,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
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
import { Textarea } from '@/components/ui/textarea';
import { type WhatsappSession } from '@/features/whatsapp-sessions/data/schema';
import { type WhatsappTemplate } from '@/features/whatsapp-templates/data/schema';
import { type Customer } from '../data/schema';

type CustomersWhatsappTabProps = {
  customer: Customer;
  onSuccess?: () => void;
};

export function CustomersWhatsappTab({
  customer,
  onSuccess,
}: CustomersWhatsappTabProps) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<WhatsappSession[]>([]);
  const [selectedSession, setSelectedSession] =
    useState<WhatsappSession | null>(null);
  const [templates, setTemplates] = useState<WhatsappTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<WhatsappTemplate | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{
    base64: string;
    type: string;
    name: string;
  } | null>(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (!selectedSession || !customer.phone) {
      setIsValid(false);
      return;
    }

    const validatePhone = async () => {
      setIsValidating(true);
      try {
        const cleanPhone = customer.phone
          .replace(/\D/g, '')
          .replace(/^(\+)|^0/g, '');
        const { numberExists } = await checkExists(
          selectedSession.title,
          cleanPhone
        );
        setIsValid(numberExists);
        if (!numberExists) {
          toast.error('Bu telefon numarası WhatsApp kullanmıyor.');
        }
      } catch {
        setIsValid(false);
        toast.error('Telefon numarası kontrol edilirken bir hata oluştu.');
      } finally {
        setIsValidating(false);
      }
    };

    validatePhone();
  }, [selectedSession, customer.phone]);

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

  const replacePlaceholders = (message: string): string => {
    const firstName = customer.name.split(' ')[0];
    const userName = user?.name || '';
    return message.replace(/{name}/g, firstName).replace(/{user}/g, userName);
  };

  const formatWhatsAppMessage = (message: string): React.ReactNode => {
    const processedMessage = replacePlaceholders(message);

    const parts: React.ReactNode[] = [];
    let currentIndex = 0;
    let key = 0;

    const regex = /(\*[^*]+\*)|(_[^_]+_)|(~[^~]+~)|(`[^`]+`)/g;
    let match;

    while ((match = regex.exec(processedMessage)) !== null) {
      if (match.index > currentIndex) {
        parts.push(processedMessage.slice(currentIndex, match.index));
      }

      const matchedText = match[0];
      const innerText = matchedText.slice(1, -1);

      if (matchedText.startsWith('*')) {
        parts.push(
          <strong key={key++} className="font-bold">
            {innerText}
          </strong>
        );
      } else if (matchedText.startsWith('_')) {
        parts.push(
          <em key={key++} className="italic">
            {innerText}
          </em>
        );
      } else if (matchedText.startsWith('~')) {
        parts.push(
          <span key={key++} className="line-through">
            {innerText}
          </span>
        );
      } else if (matchedText.startsWith('`')) {
        parts.push(
          <code key={key++} className="bg-muted rounded px-1 font-mono text-sm">
            {innerText}
          </code>
        );
      }

      currentIndex = match.index + matchedText.length;
    }

    if (currentIndex < processedMessage.length) {
      parts.push(processedMessage.slice(currentIndex));
    }

    return parts.length > 0 ? parts : processedMessage;
  };

  const handleSend = async () => {
    if (!selectedSession || !isValid) {
      toast.error(
        'Lütfen oturum seçin ve geçerli bir numara olduğundan emin olun.'
      );
      return;
    }

    const rawMessageText = selectedTemplate?.message || customMessage;
    if (!rawMessageText && !uploadedFile) {
      toast.error('Lütfen bir mesaj yazın veya dosya yükleyin.');
      return;
    }

    const messageText = rawMessageText
      ? replacePlaceholders(rawMessageText)
      : '';

    setIsSending(true);

    try {
      const chatId =
        customer.phone.replace(/\D/g, '').replace(/^(\+)|^0/g, '') + '@c.us';

      const baseData = {
        session: selectedSession.title,
        chatId,
        text: messageText,
      };

      if (uploadedFile) {
        if (uploadedFile.type.startsWith('image/')) {
          await sendImage({
            ...baseData,
            image: uploadedFile.base64,
          });
        } else {
          await sendFile({
            ...baseData,
            file: uploadedFile.base64,
          });
        }
      } else {
        await sendText(baseData);
      }

      toast.success('WhatsApp mesajı başarıyla gönderildi.');

      setSelectedSession(null);
      setSelectedTemplate(null);
      setUploadedFile(null);
      setIsValid(false);
      setCustomMessage('');

      onSuccess?.();
    } catch {
      toast.error('Mesaj gönderilirken bir hata oluştu.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex max-h-[60vh] flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto px-0.5">
        <div className="space-y-2">
          <Label>WhatsApp Oturumu</Label>
          <Select
            value={selectedSession?.id.toString()}
            onValueChange={(value) => {
              const session = sessions.find((s) => s.id.toString() === value);
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

        {selectedSession && (
          <div className="space-y-2">
            <Label>Numara Durumu</Label>
            <div
              className={`rounded-md border p-3 ${
                isValidating
                  ? 'border-muted bg-muted'
                  : isValid
                    ? 'border-green-500 bg-green-50'
                    : 'border-red-500 bg-red-50'
              }`}
            >
              {isValidating ? (
                <div className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="text-sm">Kontrol ediliyor...</span>
                </div>
              ) : isValid ? (
                <div className="flex items-center text-green-700">
                  <Check className="mr-2 h-4 w-4" />
                  <span className="text-sm">WhatsApp kullanıyor ✓</span>
                </div>
              ) : (
                <div className="flex items-center text-red-700">
                  <span className="text-sm">WhatsApp kullanmıyor</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label className={!isValid ? 'opacity-50' : ''}>
            WhatsApp Şablonu (Opsiyonel)
          </Label>
          <Select
            value={selectedTemplate?.id.toString() || ''}
            onValueChange={(value) => {
              if (value === 'none') {
                setSelectedTemplate(null);
              } else {
                const template = templates.find(
                  (t) => t.id.toString() === value
                );
                setSelectedTemplate(template || null);
                if (template) {
                  setCustomMessage('');
                }
              }
            }}
            disabled={isLoadingTemplates || !isValid}
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
            <Label className={!isValid ? 'opacity-50' : ''}>Özel Mesaj</Label>
            <Textarea
              placeholder="Mesajınızı buraya yazın..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              disabled={!isValid}
              rows={4}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label className={!isValid ? 'opacity-50' : ''}>
            Dosya/Resim Ekle (Opsiyonel)
          </Label>
          <div className="space-y-2">
            <Input
              type="file"
              accept="image/jpeg,image/png,image/jpg,application/pdf"
              onChange={handleFileUpload}
              disabled={!isValid}
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

        {(selectedTemplate || customMessage || uploadedFile) && (
          <div className="space-y-2">
            <Label>Önizleme</Label>
            <div className="bg-muted rounded-md p-4">
              <div className="flex max-w-md items-start gap-3">
                <div className="bg-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                  <MessageSquare className="text-primary h-4 w-4" />
                </div>
                <div className="bg-background flex-1 space-y-2 rounded-lg p-3 shadow-sm">
                  {uploadedFile && uploadedFile.type.startsWith('image/') && (
                    <img
                      src={`data:${uploadedFile.type};base64,${uploadedFile.base64}`}
                      alt="Preview"
                      className="h-auto w-full rounded-md"
                    />
                  )}
                  {uploadedFile && !uploadedFile.type.startsWith('image/') && (
                    <div className="bg-muted flex items-center gap-2 rounded-md p-2">
                      <FileIcon className="h-4 w-4" />
                      <span className="text-sm">{uploadedFile.name}</span>
                    </div>
                  )}
                  {(selectedTemplate?.message || customMessage) && (
                    <p className="text-sm whitespace-pre-wrap">
                      {formatWhatsAppMessage(
                        selectedTemplate?.message || customMessage
                      )}
                    </p>
                  )}
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
          </div>
        )}
      </div>

      <div className="flex-shrink-0 border-t pt-4">
        <div className="flex justify-end">
          <Button
            onClick={handleSend}
            disabled={
              !selectedSession ||
              !isValid ||
              (!selectedTemplate && !customMessage && !uploadedFile) ||
              isSending
            }
          >
            {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Gönder
          </Button>
        </div>
      </div>
    </div>
  );
}
