'use client';

import { useEffect, useState } from 'react';
import { getWhatsappMedia } from '@/services/whatsapp-service';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { fetchWhatsappApiUrl } from '@/lib/whatsapp-api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type WhatsappSessionsQrCodeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionTitle: string;
};

export function WhatsappSessionsQrCodeDialog({
  open,
  onOpenChange,
  sessionTitle,
}: WhatsappSessionsQrCodeDialogProps) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadQrCode = async () => {
    try {
      setLoading(true);
      const apiUrl = await fetchWhatsappApiUrl();
      if (!apiUrl) {
        throw new Error('WhatsApp API URL bulunamadı');
      }

      const qrUrl = `${apiUrl}/${sessionTitle}/auth/qr?format=image`;
      const qrCodeData = await getWhatsappMedia(qrUrl);
      setQrCode(qrCodeData);
    } catch (error) {
      toast.error('Hata', {
        description: `QR kod yüklenirken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`,
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && sessionTitle) {
      loadQrCode();
    } else {
      setQrCode(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, sessionTitle]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-start">
          <DialogTitle>WhatsApp QR Kod</DialogTitle>
          <DialogDescription>
            WhatsApp uygulamanızda bu QR kodu tarayarak oturumu başlatın.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center py-6">
          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
              <p className="text-muted-foreground text-sm">
                QR kod yükleniyor...
              </p>
            </div>
          ) : qrCode ? (
            <img
              src={qrCode}
              alt="WhatsApp QR Code"
              className="h-64 w-64 rounded-lg border"
            />
          ) : (
            <p className="text-muted-foreground text-sm">QR kod yüklenemedi</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
