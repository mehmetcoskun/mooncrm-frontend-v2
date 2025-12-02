'use client';

import { useState } from 'react';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createWhatsappTemplate,
  updateWhatsappTemplate,
} from '@/services/whatsapp-template-service';
import { languages } from 'countries-list';
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
import { SelectDropdown } from '@/components/select-dropdown';
import { type WhatsappTemplate } from '../data/schema';

const formSchema = z.object({
  title: z.string().min(1, 'WhatsApp şablon adı gereklidir.'),
  language: z.string().min(1, 'WhatsApp şablon dili gereklidir.'),
  message: z.string().min(1, 'WhatsApp şablon mesajı gereklidir.'),
  isEdit: z.boolean(),
});
type WhatsappTemplateForm = z.infer<typeof formSchema>;

type WhatsappTemplatesActionDialogProps = {
  currentRow?: WhatsappTemplate;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function WhatsappTemplatesActionDialog({
  currentRow,
  open,
  onOpenChange,
  onSuccess,
}: WhatsappTemplatesActionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const languageOptions = Object.entries(languages).map(([code, lang]) => ({
    value: code,
    label: lang.name,
  }));

  const isEdit = !!currentRow;
  const form = useForm<WhatsappTemplateForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          title: currentRow.title,
          language: currentRow.language,
          message: currentRow.message,
          isEdit,
        }
      : {
          title: '',
          language: '',
          message: '',
          isEdit,
        },
  });

  const onSubmit = async (values: WhatsappTemplateForm) => {
    try {
      setIsLoading(true);

      if (isEdit && currentRow) {
        await updateWhatsappTemplate(currentRow.id, values);
        toast.success('WhatsApp şablonu güncellendi', {
          description: `${values.title} WhatsApp şablonu başarıyla güncellendi.`,
        });
      } else {
        await createWhatsappTemplate(values);
        toast.success('WhatsApp şablonu eklendi', {
          description: `${values.title} WhatsApp şablonu başarıyla eklendi.`,
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle>
            {isEdit ? 'WhatsApp Şablonu Düzenle' : 'Yeni WhatsApp Şablonu Ekle'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'WhatsApp şablonunu burada güncelleyin. '
              : 'Yeni WhatsApp şablonunu burada oluşturun. '}
            İşlem tamamlandığında kaydet'e tıklayın.
          </DialogDescription>
        </DialogHeader>
        <div className="py-1">
          <Form {...form}>
            <form
              id="whatsapp-template-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 px-0.5"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>WhatsApp Şablon Adı</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="WhatsApp Şablon Adı"
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
                name="language"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Dil</FormLabel>
                    <FormControl>
                      <SelectDropdown
                        defaultValue={field.value || ''}
                        onValueChange={(value) => {
                          field.onChange(value);
                        }}
                        placeholder="Dil seçin"
                        items={languageOptions}
                        isControlled={true}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>WhatsApp Şablon Mesajı</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="WhatsApp Şablon Mesajı"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <div className="text-muted-foreground space-y-1 text-xs">
                      <p className="font-medium">Kullanılabilir değişkenler:</p>
                      <p>
                        <code className="text-xs">{'{name}'}</code> - Müşterinin
                        adı ve soyadı
                      </p>
                    </div>
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
          <Button
            type="submit"
            form="whatsapp-template-form"
            disabled={isLoading}
          >
            {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
