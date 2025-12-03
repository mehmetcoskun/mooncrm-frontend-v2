'use client';

import { useState } from 'react';
import { createWebForm } from '@/services/web-form-service';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { type WebForm } from '../data/schema';

type WebFormsDuplicateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow: WebForm;
  onSuccess?: () => void;
};

export function WebFormsDuplicateDialog({
  open,
  onOpenChange,
  currentRow,
  onSuccess,
}: WebFormsDuplicateDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDuplicate = async () => {
    try {
      setIsLoading(true);

      const duplicatedData = {
        uuid: crypto.randomUUID(),
        title: `${currentRow.title} (Kopya)`,
        fields: currentRow.fields,
        styles: currentRow.styles,
        redirect_url: currentRow.redirect_url,
        email_recipients: currentRow.email_recipients,
        domain: currentRow.domain,
        category_id: currentRow.category_id,
        rate_limit_settings: currentRow.rate_limit_settings,
      };

      await createWebForm(duplicatedData);

      onOpenChange(false);
      toast.success('Web formu kopyalandı', {
        description: `${currentRow.title} adlı web formu başarıyla kopyalandı.`,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error('Hata', {
        description: `Kopyalama işlemi sırasında bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDuplicate}
      disabled={isLoading}
      title={
        <span className="text-primary">
          <Copy className="stroke-primary me-1 inline-block" size={18} /> Web
          Formu Kopyala
        </span>
      }
      desc={
        <div className="space-y-4">
          <p className="mb-2">
            <span className="font-bold">{currentRow.title}</span> adlı web formu
            kopyalamak istediğinizden emin misiniz?
            <br />
            Bu işlem, tüm form alanları ve ayarlarıyla birlikte yeni bir web
            formu oluşturacaktır.
          </p>
        </div>
      }
      confirmText={isLoading ? 'Kopyalanıyor...' : 'Kopyala'}
      cancelBtnText="İptal"
    />
  );
}
