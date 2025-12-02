'use client';

import { useState } from 'react';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createEmailTemplate,
  updateEmailTemplate,
} from '@/services/email-template-service';
import { languages } from 'countries-list';
import { PaletteIcon } from 'lucide-react';
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
import { EmailEditorSheet } from '@/components/email-editor';
import { SelectDropdown } from '@/components/select-dropdown';
import { type EmailTemplate } from '../data/schema';

const formSchema = z.object({
  title: z.string().min(1, 'E-Posta Şablon Adı gereklidir.'),
  language: z.string().min(1, 'E-Posta Şablon Dili gereklidir.'),
  subject: z.string().min(1, 'E-Posta Şablon Konusu gereklidir.'),
  template: z.string().nullable(),
  html: z.string().nullable(),
  isEdit: z.boolean(),
});
type EmailTemplateForm = z.infer<typeof formSchema>;

type EmailTemplateActionDialogProps = {
  currentRow?: EmailTemplate;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function EmailTemplatesActionDialog({
  currentRow,
  open,
  onOpenChange,
  onSuccess,
}: EmailTemplateActionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);

  const languageOptions = Object.entries(languages).map(([code, lang]) => ({
    value: code,
    label: lang.name,
  }));

  const isEdit = !!currentRow;
  const form = useForm<EmailTemplateForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          title: currentRow.title,
          language: currentRow.language,
          subject: currentRow.subject,
          template: currentRow.template,
          html: currentRow.html,
          isEdit,
        }
      : {
          title: '',
          language: '',
          subject: '',
          template: null,
          html: null,
          isEdit,
        },
  });

  const handleEditorSave = (template: string, html: string) => {
    form.setValue('template', template);
    form.setValue('html', html);
    setEditorOpen(false);
    toast.success('Tasarım kaydedildi', {
      description: 'E-posta tasarımı başarıyla kaydedildi.',
    });
  };

  const onSubmit = async (values: EmailTemplateForm) => {
    try {
      setIsLoading(true);

      if (isEdit && currentRow) {
        await updateEmailTemplate(currentRow.id, values);
        toast.success('E-Posta Şablon güncellendi', {
          description: `${values.title} E-Posta Şablon başarıyla güncellendi.`,
        });
      } else {
        await createEmailTemplate(values);
        toast.success('E-Posta Şablon eklendi', {
          description: `${values.title} E-Posta Şablon başarıyla eklendi.`,
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
            {isEdit ? 'E-Posta Şablon Düzenle' : 'Yeni E-Posta Şablon Ekle'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'E-Posta şablonunu burada güncelleyin. '
              : 'Yeni e-posta şablonunu burada oluşturun. '}
            İşlem tamamlandığında kaydet'e tıklayın.
          </DialogDescription>
        </DialogHeader>
        <div className="py-1">
          <Form {...form}>
            <form
              id="email-template-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 px-0.5"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>E-Posta Şablon Adı</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="E-Posta Şablon Adı"
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
                name="subject"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Konu</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="E-Posta konusu"
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
                  E-Posta Tasarımı Düzenle
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
          <Button type="submit" form="email-template-form" disabled={isLoading}>
            {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogFooter>
      </DialogContent>

      <EmailEditorSheet
        open={editorOpen}
        onOpenChange={setEditorOpen}
        initialTemplate={form.watch('template')}
        onSave={handleEditorSave}
      />
    </Dialog>
  );
}
