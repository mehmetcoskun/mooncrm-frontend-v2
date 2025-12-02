'use client';

import { useState } from 'react';
import { type Table } from '@tanstack/react-table';
import { bulkUpdateStatus } from '@/services/customer-service';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { type Status } from '@/features/statuses/data/schema';
import { type Customer } from '../data/schema';

type CustomersBulkStatusDialogProps<TData> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table<TData>;
  statuses: Status[];
  onSuccess: () => void;
};

export function CustomersBulkStatusDialog<TData>({
  open,
  onOpenChange,
  table,
  statuses,
  onSuccess,
}: CustomersBulkStatusDialogProps<TData>) {
  const [selectedStatusId, setSelectedStatusId] = useState<string>('');

  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const handleUpdate = async () => {
    if (!selectedStatusId) {
      toast.error('Lütfen bir durum seçiniz.');
      return;
    }

    try {
      const customerIds = selectedRows.map(
        (row) => (row.original as Customer).id
      );
      await bulkUpdateStatus(customerIds, Number(selectedStatusId));
      toast.success(`${selectedRows.length} müşterinin durumu güncellendi`);
      table.resetRowSelection();
      onSuccess();
      onOpenChange(false);
      setSelectedStatusId('');
    } catch (_error) {
      toast.error('Durum güncellenirken bir hata oluştu');
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleUpdate}
      disabled={!selectedStatusId}
      title={`${selectedRows.length} müşterinin durumunu değiştir`}
      desc={
        <div className="space-y-4">
          <p className="mb-2">
            Seçilen {selectedRows.length} müşterinin durumunu değiştirmek
            istediğinizden emin misiniz?
          </p>

          <Label className="my-4 flex flex-col items-start gap-1.5">
            <span>Yeni Durum:</span>
            <Select
              value={selectedStatusId}
              onValueChange={setSelectedStatusId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Durum seçiniz" />
              </SelectTrigger>
              <SelectContent>
                {statuses?.map((status) => (
                  <SelectItem key={status.id} value={status.id.toString()}>
                    {status.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Label>
        </div>
      }
      confirmText="Güncelle"
      cancelBtnText="İptal"
    />
  );
}
