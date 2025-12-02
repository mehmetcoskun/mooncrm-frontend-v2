'use client';

import { useState } from 'react';
import { type Table } from '@tanstack/react-table';
import { bulkUpdateCategory } from '@/services/customer-service';
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
import { type Category } from '@/features/categories/data/schema';
import { type Customer } from '../data/schema';

type CustomersBulkCategoryDialogProps<TData> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table<TData>;
  categories: Category[];
  onSuccess: () => void;
};

export function CustomersBulkCategoryDialog<TData>({
  open,
  onOpenChange,
  table,
  categories,
  onSuccess,
}: CustomersBulkCategoryDialogProps<TData>) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const handleUpdate = async () => {
    if (!selectedCategoryId) {
      toast.error('Lütfen bir kategori seçiniz.');
      return;
    }

    try {
      const customerIds = selectedRows.map(
        (row) => (row.original as Customer).id
      );
      await bulkUpdateCategory(customerIds, Number(selectedCategoryId));
      toast.success(`${selectedRows.length} müşterinin kategorisi güncellendi`);
      table.resetRowSelection();
      onSuccess();
      onOpenChange(false);
      setSelectedCategoryId('');
    } catch (_error) {
      toast.error('Kategori güncellenirken bir hata oluştu');
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleUpdate}
      disabled={!selectedCategoryId}
      title={`${selectedRows.length} müşterinin kategorisini değiştir`}
      desc={
        <div className="space-y-4">
          <p className="mb-2">
            Seçilen {selectedRows.length} müşterinin kategorisini değiştirmek
            istediğinizden emin misiniz?
          </p>

          <Label className="my-4 flex flex-col items-start gap-1.5">
            <span>Yeni Kategori:</span>
            <Select
              value={selectedCategoryId}
              onValueChange={setSelectedCategoryId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Kategori seçiniz" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.title}
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
