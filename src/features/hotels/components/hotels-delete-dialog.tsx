'use client';

import { useState } from 'react';
import { destroyHotel } from '@/services/hotel-service';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { type Hotel } from '../data/schema';

type HotelsDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow: Hotel;
  onSuccess?: () => void;
};

export function HotelsDeleteDialog({
  open,
  onOpenChange,
  currentRow,
  onSuccess,
}: HotelsDeleteDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await destroyHotel(currentRow.id);

      onOpenChange(false);
      toast.success('Otel silindi', {
        description: `${currentRow.name} otel başarıyla silindi.`,
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
          Otel Sil
        </span>
      }
      desc={
        <div className="space-y-4">
          <p className="mb-2">
            <span className="font-bold">{currentRow.name}</span> oteli silmek
            istediğinizden emin misiniz?
            <br />
            Bu işlem, <span className="font-bold">{currentRow.name}</span>{' '}
            otelini sistemden kalıcı olarak kaldıracaktır. Bu işlem geri
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
