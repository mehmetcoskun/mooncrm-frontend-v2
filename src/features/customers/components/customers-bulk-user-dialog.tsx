'use client';

import { useState } from 'react';
import { type Table } from '@tanstack/react-table';
import { bulkUpdateUser } from '@/services/customer-service';
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
import { type User } from '@/features/users/data/schema';
import { type Customer } from '../data/schema';

type CustomersBulkUserDialogProps<TData> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table<TData>;
  users: User[];
  onSuccess: () => void;
};

export function CustomersBulkUserDialog<TData>({
  open,
  onOpenChange,
  table,
  users,
  onSuccess,
}: CustomersBulkUserDialogProps<TData>) {
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const handleUpdate = async () => {
    if (!selectedUserId) {
      toast.error('Lütfen bir danışman seçiniz.');
      return;
    }

    try {
      const customerIds = selectedRows.map(
        (row) => (row.original as Customer).id
      );
      await bulkUpdateUser(customerIds, Number(selectedUserId));
      toast.success(`${selectedRows.length} müşterinin danışmanı güncellendi`);
      table.resetRowSelection();
      onSuccess();
      onOpenChange(false);
      setSelectedUserId('');
    } catch (_error) {
      toast.error('Danışman güncellenirken bir hata oluştu');
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleUpdate}
      disabled={!selectedUserId}
      title={`${selectedRows.length} müşterinin danışmanını değiştir`}
      desc={
        <div className="space-y-4">
          <p className="mb-2">
            Seçilen {selectedRows.length} müşterinin danışmanını değiştirmek
            istediğinizden emin misiniz?
          </p>

          <Label className="my-4 flex flex-col items-start gap-1.5">
            <span>Yeni Danışman:</span>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Danışman seçiniz" />
              </SelectTrigger>
              <SelectContent>
                {users?.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.name}
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
