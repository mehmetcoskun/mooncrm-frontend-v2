'use client';

import { useState } from 'react';
import { destroyVapiPhoneNumber } from '@/services/vapi-service';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { type PhoneNumber } from '../data/schema';

type PhoneNumbersDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow: PhoneNumber;
  onSuccess?: () => void;
};

export function PhoneNumbersDeleteDialog({
  open,
  onOpenChange,
  currentRow,
  onSuccess,
}: PhoneNumbersDeleteDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await destroyVapiPhoneNumber(currentRow.id);

      onOpenChange(false);
      toast.success('Telefon numarası silindi', {
        description: `${currentRow.number} numaralı telefon başarıyla silindi.`,
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
          Telefon Numarası Sil
        </span>
      }
      desc={
        <div className="space-y-4">
          <p className="mb-2">
            <span className="font-bold">{currentRow.number}</span> numaralı
            telefonu silmek istediğinizden emin misiniz?
            <br />
            Bu işlem, <span className="font-bold">
              {currentRow.number}
            </span>{' '}
            numaralı telefonu sistemden kalıcı olarak kaldıracaktır. Bu işlem
            geri alınamaz.
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
