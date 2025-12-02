'use client';

import { useState } from 'react';
import { type Table } from '@tanstack/react-table';
import { bulkDeleteCustomers } from '@/services/customer-service';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { type Customer } from '../data/schema';

type CustomersMultiDeleteDialogProps<TData> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table<TData>;
  onSuccess: () => void;
};

const CONFIRM_WORD = 'SİL';

export function CustomersMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
  onSuccess,
}: CustomersMultiDeleteDialogProps<TData>) {
  const [value, setValue] = useState('');

  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const handleDelete = async () => {
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(`Lütfen "${CONFIRM_WORD}" yazınız.`);
      return;
    }

    try {
      const customerIds = selectedRows.map(
        (row) => (row.original as Customer).id
      );
      await bulkDeleteCustomers(customerIds);
      toast.success(`${selectedRows.length} müşteri silindi`);
      table.resetRowSelection();
      onSuccess();
      onOpenChange(false);
      setValue('');
    } catch (_error) {
      toast.error('Müşteriler silinirken bir hata oluştu');
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== CONFIRM_WORD}
      title={
        <span className="text-destructive">
          <AlertTriangle
            className="stroke-destructive me-1 inline-block"
            size={18}
          />{' '}
          {selectedRows.length} müşteriyi sil
        </span>
      }
      desc={
        <div className="space-y-4">
          <p className="mb-2">
            Seçilen müşterileri silmek istediğinizden emin misiniz? <br />
            Bu işlem geri alınamaz.
          </p>

          <Label className="my-4 flex flex-col items-start gap-1.5">
            <span className="">"{CONFIRM_WORD}" yazınız:</span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`"${CONFIRM_WORD}" yazınız.`}
            />
          </Label>

          <Alert variant="destructive">
            <AlertTitle>Uyarı!</AlertTitle>
            <AlertDescription>
              Lütfen dikkatli olun, bu işlem geri alınamaz.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText="Sil"
      cancelBtnText="İptal"
      destructive
    />
  );
}
