'use client';

import { useState } from 'react';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTransfer, updateTransfer } from '@/services/transfer-service';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { WhatsappChatSelector } from '@/components/whatsapp-chat-selector';
import { type Transfer } from '../data/schema';

const formSchema = z.object({
  name: z.string().min(1, 'Transfer adı gereklidir.'),
  chat_id: z.string().nullable(),
  message_templates: z
    .object({
      sale: z.string().nullable(),
      cancel: z.string().nullable(),
    })
    .nullable(),
  isEdit: z.boolean(),
});
type TransferForm = z.infer<typeof formSchema>;

type TransferActionDialogProps = {
  currentRow?: Transfer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function TransfersActionDialog({
  currentRow,
  open,
  onOpenChange,
  onSuccess,
}: TransferActionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [chatSelectorOpen, setChatSelectorOpen] = useState(false);

  const isEdit = !!currentRow;
  const form = useForm<TransferForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          name: currentRow.name,
          chat_id: currentRow.chat_id,
          message_templates: currentRow.message_templates,
          isEdit,
        }
      : {
          name: '',
          chat_id: null,
          message_templates: {
            sale: 'Merhabalar,\n\nİsim Soyisim: {name}\nKişi Sayısı: {person_count}\nOtel: {hotel_name}\nDanışman: {user}\n\n--- GELİŞ UÇUŞU ---\nTarih: {arrival_date}\nSaat: {arrival_time}\nUçuş Kodu: {arrival_flight_code}\n\n--- DÖNÜŞ UÇUŞU ---\nTarih: {departure_date}\nSaat: {departure_time} (ALINMA SAATİ)\nUçuş Kodu: {departure_flight_code}\n\nTransfer Rezervasyonu Rica Ederiz.\n\nİyi Çalışmalar Dileriz.',
            cancel:
              'Merhabalar,\n\nİsim Soyisim: {name}\nKişi Sayısı: {person_count}\nOtel: {hotel_name}\nDanışman: {user}\n\n--- GELİŞ UÇUŞU ---\nTarih: {arrival_date}\nSaat: {arrival_time}\nUçuş Kodu: {arrival_flight_code}\n\n--- DÖNÜŞ UÇUŞU ---\nTarih: {departure_date}\nSaat: {departure_time} (ALINMA SAATİ)\nUçuş Kodu: {departure_flight_code}\n\nTransfer Rezervasyonu İptali Rica Ederiz.\n\nİyi Çalışmalar Dileriz.',
          },
          isEdit,
        },
  });

  const onSubmit = async (values: TransferForm) => {
    try {
      setIsLoading(true);

      if (isEdit && currentRow) {
        await updateTransfer(currentRow.id, values);
        toast.success('Transfer güncellendi', {
          description: `${values.name} transfer başarıyla güncellendi.`,
        });
      } else {
        await createTransfer(values);
        toast.success('Transfer eklendi', {
          description: `${values.name} transfer başarıyla eklendi.`,
        });
      }

      form.reset();
      onOpenChange(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error('Hata', {
        description: `İşlem sırasında bir hata oluştu: ${error instanceof AxiosError ? error.response?.data.message : 'Bilinmeyen hata'}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset();
        onOpenChange(state);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle>
            {isEdit ? 'Transfer Düzenle' : 'Yeni Transfer Ekle'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Transferini burada güncelleyin. '
              : 'Yeni transferi burada oluşturun. '}
            İşlem tamamlandığında kaydet'e tıklayın.
          </DialogDescription>
        </DialogHeader>
        <div className="py-1">
          <Form {...form}>
            <form
              id="transfer-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 px-0.5"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Transfer Adı</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Transfer Adı"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="chat_id"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Chat ID</FormLabel>
                    <FormControl>
                      <div className="flex w-full items-center gap-2">
                        <Input
                          placeholder="Chat ID"
                          autoComplete="off"
                          disabled
                          {...field}
                          value={field.value ?? ''}
                        />
                        <Button
                          variant="outline"
                          type="button"
                          onClick={() => setChatSelectorOpen(true)}
                        >
                          <Search className="size-4" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message_templates.sale"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Satış Mesaj Şablonu</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Satış mesaj şablonunu girin..."
                        className="min-h-[100px]"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <div className="text-muted-foreground space-y-1 text-xs">
                      <p className="font-medium">Kullanılabilir değişkenler:</p>
                      <p>
                        <code className="text-xs">{'{name}'}</code> - Müşterinin
                        adı ve soyadı
                      </p>
                      <p>
                        <code className="text-xs">{'{check_in}'}</code> - Giriş
                        tarihi
                      </p>
                      <p>
                        <code className="text-xs">{'{check_out}'}</code> - Çıkış
                        tarihi
                      </p>
                      <p>
                        <code className="text-xs">{'{room_type}'}</code> - Oda
                        tipi
                      </p>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message_templates.cancel"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>İptal Mesaj Şablonu</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="İptal mesaj şablonunu girin..."
                        className="min-h-[100px]"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <div className="text-muted-foreground space-y-1 text-xs">
                      <p className="font-medium">Kullanılabilir değişkenler:</p>
                      <p>
                        <code className="text-xs">{'{name}'}</code> - Müşterinin
                        adı ve soyadı
                      </p>
                      <p>
                        <code className="text-xs">{'{check_in}'}</code> - Giriş
                        tarihi
                      </p>
                      <p>
                        <code className="text-xs">{'{check_out}'}</code> - Çıkış
                        tarihi
                      </p>
                      <p>
                        <code className="text-xs">{'{room_type}'}</code> - Oda
                        tipi
                      </p>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            İptal
          </Button>
          <Button type="submit" form="transfer-form" disabled={isLoading}>
            {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogFooter>
      </DialogContent>

      <WhatsappChatSelector
        open={chatSelectorOpen}
        onOpenChange={setChatSelectorOpen}
        onSelectChat={(chatId) => {
          form.setValue('chat_id', chatId);
        }}
      />
    </Dialog>
  );
}
