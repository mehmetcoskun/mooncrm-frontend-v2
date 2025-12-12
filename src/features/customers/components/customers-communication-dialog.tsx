'use client';

import { useState } from 'react';
import { Mail, MessageSquare, Phone } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type Customer } from '../data/schema';
import { CustomersEmailTab } from './customers-email-tab';
import { CustomersPhoneTab } from './customers-phone-tab';
import { CustomersSmsTab } from './customers-sms-tab';
import { CustomersWhatsappTab } from './customers-whatsapp-tab';

type CustomersCommunicationDialogProps = {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function CustomersCommunicationDialog({
  customer,
  open,
  onOpenChange,
  onSuccess,
}: CustomersCommunicationDialogProps) {
  const [activeTab, setActiveTab] = useState('whatsapp');
  const { hasPermission } = usePermissions();

  const canSendWhatsapp = hasPermission('marketing_SendWhatsapp');
  const canSendSms = hasPermission('marketing_SendSms');
  const canSendEmail = hasPermission('marketing_SendMail');
  const canSendCall = hasPermission('marketing_SendCall');

  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col">
        <DialogHeader className="flex-shrink-0 text-start">
          <DialogTitle>İletişim - {customer.name}</DialogTitle>
          <DialogDescription>
            {customer.phone && <span>Telefon: {customer.phone}</span>}
            {customer.email && (
              <span className="ml-4">E-posta: {customer.email}</span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-1">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4">
              {canSendWhatsapp && (
                <TabsTrigger
                  value="whatsapp"
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  WhatsApp
                </TabsTrigger>
              )}
              {canSendSms && (
                <TabsTrigger value="sms" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  SMS
                </TabsTrigger>
              )}
              {canSendEmail && (
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  E-Posta
                </TabsTrigger>
              )}
              {canSendCall && (
                <TabsTrigger value="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Telefon
                </TabsTrigger>
              )}
            </TabsList>

            {canSendWhatsapp && (
              <TabsContent value="whatsapp" className="mt-4">
                <CustomersWhatsappTab
                  customer={customer}
                  onSuccess={onSuccess}
                />
              </TabsContent>
            )}

            {canSendSms && (
              <TabsContent value="sms" className="mt-4">
                <CustomersSmsTab customer={customer} onSuccess={onSuccess} />
              </TabsContent>
            )}

            {canSendEmail && (
              <TabsContent value="email" className="mt-4">
                <CustomersEmailTab customer={customer} onSuccess={onSuccess} />
              </TabsContent>
            )}

            {canSendCall && (
              <TabsContent value="phone" className="mt-4">
                <CustomersPhoneTab customer={customer} onSuccess={onSuccess} />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
