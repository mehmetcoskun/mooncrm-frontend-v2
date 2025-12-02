'use client';

import { useState } from 'react';
import { destroySmsTemplate } from '@/services/sms-template-service';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { type SmsTemplate } from '../data/schema';

type SmsTemplatesDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow: SmsTemplate;
  onSuccess?: () => void;
};

export function SmsTemplatesDeleteDialog({
  open,
  onOpenChange,
  currentRow,
  onSuccess,
}: SmsTemplatesDeleteDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await destroySmsTemplate(currentRow.id);

      onOpenChange(false);
      toast.success('SMS Şablonu silindi', {
        description: `${currentRow.title} SMS şablonu başarıyla silindi.`,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error('Hata', {
        description: `Silme işlemi sırasında bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={isLoading}
      title={
        <span className="text-destructive">
          <AlertTriangle
            className="stroke-destructive me-1 inline-block"
            size={18}
          />{' '}
          SMS Şablonu Sil
        </span>
      }
      desc={
        <div className="space-y-4">
          <p className="mb-2">
            <span className="font-bold">{currentRow.title}</span> adlı SMS
            şablonu silmek istediğinizden emin misiniz?
            <br />
            Bu işlem, <span className="font-bold">{currentRow.title}</span> adlı
            SMS şablonunu sistemden kalıcı olarak kaldıracaktır. Bu işlem geri
            alınamaz.
          </p>

          <Alert variant="destructive">
            <AlertTitle>Uyarı!</AlertTitle>
            <AlertDescription>
              Lütfen dikkatli olun, bu işlem geri alınamaz.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText={isLoading ? 'Siliniyor...' : 'Sil'}
      cancelBtnText="İptal"
      destructive
    />
  );
}
