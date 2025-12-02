'use client';

import { useState } from 'react';
import { destroyPermission } from '@/services/permission-service';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { type Permission } from '../data/schema';

type PermissionsDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow: Permission;
  onSuccess?: () => void;
};

export function PermissionsDeleteDialog({
  open,
  onOpenChange,
  currentRow,
  onSuccess,
}: PermissionsDeleteDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await destroyPermission(currentRow.id);

      onOpenChange(false);
      toast.success('İzin silindi', {
        description: `${currentRow.title} izni başarıyla silindi.`,
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
          İzin Sil
        </span>
      }
      desc={
        <div className="space-y-4">
          <p className="mb-2">
            <span className="font-bold">{currentRow.title}</span> adlı izni
            silmek istediğinizden emin misiniz?
            <br />
            Bu işlem, <span className="font-bold">{currentRow.title}</span> adlı
            izni sistemden kalıcı olarak kaldıracaktır. Bu işlem geri alınamaz.
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
