'use client';

import { useState } from 'react';
import { sendLeadToCrm } from '@/services/facebook-lead-service';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { type FacebookLead } from '../data/schema';
import { AxiosError } from 'axios';

type FacebookLeadsSendDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow: FacebookLead;
  onSuccess?: () => void;
};

export function FacebookLeadsSendDialog({
  open,
  onOpenChange,
  currentRow,
  onSuccess,
}: FacebookLeadsSendDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!currentRow.form_id) {
      toast.error('Hata', {
        description: 'Bu lead için form ID bulunamadı.',
      });
      onOpenChange(false);
      return;
    }

    try {
      setIsLoading(true);
      await sendLeadToCrm({
        form_id: currentRow.form_id,
        field_data: currentRow.field_data,
        ad_name: currentRow.ad_name,
        adset_name: currentRow.adset_name,
        campaign_name: currentRow.campaign_name,
      });

      onOpenChange(false);
      toast.success('Başarılı', {
        description: "Lead başarıyla CRM'e aktarıldı.",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error('Hata', {
        description: (error instanceof AxiosError) ? error.response?.data.message : 'Lead aktarılırken bir hata oluştu.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleSend}
      disabled={isLoading}
      title={
        <span className="flex items-center gap-2">
          <Send className="h-4 w-4" />
          CRM'e Gönder
        </span>
      }
      desc={<p>Bu lead CRM'e aktarılacak. Devam etmek istiyor musunuz?</p>}
      confirmText={isLoading ? 'Gönderiliyor...' : 'Gönder'}
      cancelBtnText="İptal"
      isLoading={isLoading}
    />
  );
}
