'use client';

import { useState } from 'react';
import { type Table } from '@tanstack/react-table';
import { sendLeadToCrm } from '@/services/facebook-lead-service';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { type FacebookLead } from '../data/schema';

type FacebookLeadsBulkSendDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table<FacebookLead>;
  onSuccess?: () => void;
};

export function FacebookLeadsBulkSendDialog({
  open,
  onOpenChange,
  table,
  onSuccess,
}: FacebookLeadsBulkSendDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;

  const handleBulkSend = async () => {
    const leads = selectedRows.map((row) => row.original);

    if (leads.length === 0) {
      toast.error('Hata', {
        description: 'Lütfen en az bir lead seçin.',
      });
      onOpenChange(false);
      return;
    }

    const leadsWithFormId = leads.filter((lead) => lead.form_id);

    if (leadsWithFormId.length === 0) {
      toast.error('Hata', {
        description: "Seçilen lead'lerin hiçbirinde form ID bulunamadı.",
      });
      onOpenChange(false);
      return;
    }

    setIsLoading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const lead of leadsWithFormId) {
      try {
        await sendLeadToCrm({
          form_id: lead.form_id,
          field_data: lead.field_data,
          ad_name: lead.ad_name,
          adset_name: lead.adset_name,
          campaign_name: lead.campaign_name,
        });
        successCount++;
      } catch {
        errorCount++;
      }
    }

    setIsLoading(false);
    onOpenChange(false);

    if (successCount > 0) {
      toast.success('Başarılı', {
        description: `${successCount} lead başarıyla CRM'e aktarıldı.`,
      });
      table.resetRowSelection();
      onSuccess?.();
    }

    if (errorCount > 0) {
      toast.error('Hata', {
        description: `${errorCount} lead aktarılırken hata oluştu.`,
      });
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleBulkSend}
      disabled={isLoading}
      title={
        <span className="flex items-center gap-2">
          <Send className="h-4 w-4" />
          Toplu CRM'e Gönder
        </span>
      }
      desc={
        <p>
          <span className="font-bold">{selectedCount} lead</span> CRM'e
          aktarılacak. Devam etmek istiyor musunuz?
        </p>
      }
      confirmText={isLoading ? 'Gönderiliyor...' : 'Gönder'}
      cancelBtnText="İptal"
      isLoading={isLoading}
    />
  );
}
