'use client';

import { useState } from 'react';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createWebForm, updateWebForm } from '@/services/web-form-service';
import { PaletteIcon } from 'lucide-react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
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
import { type WebForm } from '../data/schema';
import { WebFormEditor } from './web-form-editor';

const formSchema = z.object({
  uuid: z.uuidv4(),
  title: z.string().min(1, 'Web formu adı gereklidir.'),
  fields: z.array(z.any()),
  styles: z.any(),
  redirect_url: z.string().nullable(),
  email_recipients: z.string().nullable(),
  domain: z.string(),
  category_id: z.number().nullable(),
  rate_limit_settings: z.any(),
  isEdit: z.boolean(),
});
type WebFormForm = z.infer<typeof formSchema>;

type WebFormActionDialogProps = {
  currentRow?: WebForm;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function WebFormsActionDialog({
  currentRow,
  open,
  onOpenChange,
  onSuccess,
}: WebFormActionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);

  const isEdit = !!currentRow;
  const form = useForm<WebFormForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          uuid: currentRow.uuid,
          title: currentRow.title,
          fields: currentRow.fields,
          styles: currentRow.styles,
          redirect_url: currentRow.redirect_url,
          email_recipients: currentRow.email_recipients,
          domain: currentRow.domain,
          category_id: currentRow.category_id,
          rate_limit_settings: currentRow.rate_limit_settings,
          isEdit,
        }
      : {
          uuid: uuidv4(),
          title: '',
          fields: [],
          styles: {
            containerBg: '#ffffff',
            containerBgEnabled: false,
            inputBg: '#ffffff',
            inputTextColor: '#000000',
            inputBorderColor: '#cccccc',
            labelColor: '#000000',
            buttonBgColor: '#0000ff',
            iframeBorderColor: '#cccccc',
            iframeBorderEnabled: false,
            labelFontSize: '14',
            buttonLabel: 'Gönder',
            alertMessages: {
              required: 'Lütfen tüm zorunlu alanları doldurun.',
              success: 'Form başarıyla gönderildi.',
              failure:
                'Form gönderilirken bir hata oluştu. Lütfen tekrar deneyiniz.',
              invalidInput: 'Lütfen geçerli bir değer giriniz.',
              rateLimit:
                'Çok hızlı form gönderimi. Lütfen 1 dakika bekleyip tekrar deneyin.',
            },
          },
          redirect_url: '',
          email_recipients: null,
          domain: '*',
          category_id: null,
          rate_limit_settings: {
            enabled: true,
            maxSubmissionsPerMinute: 1,
          },
          isEdit,
        },
  });

  const handleEditorSave = (data: WebForm) => {
    form.setValue('fields', data.fields);
    form.setValue('styles', data.styles);
    form.setValue('redirect_url', data.redirect_url);
    form.setValue('email_recipients', data.email_recipients);
    form.setValue('domain', data.domain);
    form.setValue('category_id', data.category_id);
    form.setValue('rate_limit_settings', data.rate_limit_settings);
    setEditorOpen(false);
    toast.success('Tasarım kaydedildi', {
      description: 'Web form tasarımı başarıyla kaydedildi.',
    });
  };

  const onSubmit = async (values: WebFormForm) => {
    try {
      setIsLoading(true);

      if (isEdit && currentRow) {
        await updateWebForm(currentRow.id, values);
        toast.success('Web formu güncellendi', {
          description: `${values.title} adlı web formu başarıyla güncellendi.`,
        });
      } else {
        await createWebForm(values);
        toast.success('Web formu eklendi', {
          description: `${values.title} adlı web formu başarıyla eklendi.`,
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
            {isEdit ? 'Web Formu Düzenle' : 'Yeni Web Formu Ekle'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Web formunu burada güncelleyin. '
              : 'Yeni web formu burada oluşturun. '}
            İşlem tamamlandığında kaydet'e tıklayın.
          </DialogDescription>
        </DialogHeader>
        <div className="py-1">
          <Form {...form}>
            <form
              id="web-form-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 px-0.5"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Web Formu Adı</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Web Formu Adı"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Tasarım</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setEditorOpen(true)}
                >
                  <PaletteIcon className="mr-2" />
                  Web Form Tasarımı Düzenle
                </Button>
              </div>
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
          <Button type="submit" form="web-form-form" disabled={isLoading}>
            {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogFooter>
      </DialogContent>

      <WebFormEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        onSave={handleEditorSave}
        uuid={form.watch('uuid')}
        initialFields={form.watch('fields') || []}
        styles={form.watch('styles')}
        redirect_url={form.watch('redirect_url') || ''}
        email_recipients={form.watch('email_recipients')}
        domain={form.watch('domain')}
        category_id={form.watch('category_id')}
        rate_limit_settings={form.watch('rate_limit_settings')}
      />
    </Dialog>
  );
}
