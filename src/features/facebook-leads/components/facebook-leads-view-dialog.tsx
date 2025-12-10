'use client';

import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Calendar, Facebook, Megaphone, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { type FacebookLead } from '../data/schema';

interface FacebookLeadsViewDialogProps {
  currentRow?: FacebookLead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FacebookLeadsViewDialog({
  currentRow,
  open,
  onOpenChange,
}: FacebookLeadsViewDialogProps) {
  if (!currentRow) return null;

  const createdDate = new Date(currentRow.created_time);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader className="text-left">
          <DialogTitle className="flex items-center space-x-2">
            <Facebook className="h-5 w-5" />
            <span>Lead Detayları</span>
          </DialogTitle>
          <DialogDescription>Lead ID: #{currentRow.id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="mb-3 flex items-center text-lg font-semibold">
              <User className="mr-2 h-4 w-4" />
              Kişi Bilgileri
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {currentRow.field_data &&
                Object.keys(currentRow.field_data).length > 0 &&
                Object.entries(currentRow.field_data).map(([key, value]) => (
                  <div key={key}>
                    <label className="text-muted-foreground text-sm font-medium capitalize">
                      {key.replace(/_/g, ' ')}
                    </label>
                    <div className="mt-1">
                      <span>{value || '-'}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="mb-3 flex items-center text-lg font-semibold">
              <Facebook className="mr-2 h-4 w-4" />
              Facebook Bilgileri
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Sayfa
                </label>
                <div className="mt-1">
                  <span className="font-medium">{currentRow.page_name}</span>
                </div>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Form
                </label>
                <div className="mt-1">
                  <span>{currentRow.form_name}</span>
                </div>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Oluşturulma Tarihi
                </label>
                <div className="mt-1 flex items-center space-x-2">
                  <Calendar className="text-muted-foreground h-4 w-4" />
                  <span>
                    {format(createdDate, 'dd MMMM yyyy HH:mm', { locale: tr })}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Platform
                </label>
                <div className="mt-1">
                  <Badge variant="outline" className="font-normal capitalize">
                    {currentRow.platform || 'Facebook'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="mb-3 flex items-center text-lg font-semibold">
              <Megaphone className="mr-2 h-4 w-4" />
              Reklam Bilgileri
            </h3>
            {currentRow.is_organic ? (
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Organik Lead</Badge>
                <span className="text-muted-foreground text-sm">
                  Bu lead organik olarak gelmiştir.
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Kampanya
                  </label>
                  <div className="mt-1">
                    <span>{currentRow.campaign_name || '-'}</span>
                  </div>
                </div>
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Reklam Seti
                  </label>
                  <div className="mt-1">
                    <span>{currentRow.adset_name || '-'}</span>
                  </div>
                </div>
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Reklam
                  </label>
                  <div className="mt-1">
                    <span>{currentRow.ad_name || '-'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
