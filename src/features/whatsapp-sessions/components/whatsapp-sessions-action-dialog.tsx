'use client';

import { z } from 'zod';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createSession, getSession } from '@/services/whatsapp-service';
import { createWhatsappSession } from '@/services/whatsapp-session-service';
import slugify from 'slugify';
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
import { Switch } from '@/components/ui/switch';

const formSchema = z.object({
  title: z.string().min(1, 'WhatsApp oturumu adı gereklidir.'),
  phone: z.string().min(1, 'WhatsApp numarası gereklidir.'),
  is_admin: z.boolean(),
});
type WhatsappSessionForm = z.infer<typeof formSchema>;

type WhatsappSessionsActionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function WhatsappSessionsActionDialog({
  open,
  onOpenChange,
  onSuccess,
}: WhatsappSessionsActionDialogProps) {
  const form = useForm<WhatsappSessionForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      phone: '',
      is_admin: false,
    },
  });

  const onSubmit = async (values: WhatsappSessionForm) => {
    try {
      const slugTitle = slugify(values.title, {
        lower: true,
        replacement: '_',
      });
      try {
        await getSession(slugTitle);
        toast.error('Hata', {
          description: `'${slugTitle}' isimli oturum WhatsApp servisinde zaten mevcut.`,
        });
        return;
      } catch (error) {
        if (!(error instanceof AxiosError && error.response?.status === 404)) {
          throw error;
        }
      }

      await createWhatsappSession({ ...values, title: slugTitle });

      await createSession({
        name: slugTitle,
        start: true,
      });

      toast.success('WhatsApp oturumu eklendi', {
        description: `${slugTitle} WhatsApp oturumu başarıyla eklendi.`,
      });

      form.reset();
      onOpenChange(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error('Hata', {
        description: `İşlem sırasında bir hata oluştu: ${error instanceof AxiosError ? error.response?.data.message : 'Bilinmeyen hata'}`,
      });
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
          <DialogTitle>WhatsApp Oturumu Ekle</DialogTitle>
          <DialogDescription>
            WhatsApp oturumunu burada oluşturun. İşlem tamamlandığında kaydet'e
            tıklayın.
          </DialogDescription>
        </DialogHeader>
        <div className="py-1">
          <Form {...form}>
            <form
              id="whatsapp-session-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 px-0.5"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>WhatsApp Oturumu Adı</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="WhatsApp Oturumu Adı"
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
                name="phone"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>WhatsApp Numarası</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="WhatsApp Numarası"
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
                name="is_admin"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Yönetici</FormLabel>
                      <div className="text-muted-foreground text-sm">
                        Bu oturum yönetici yetkisine sahip mi?
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button type="submit" form="whatsapp-session-form">
            Kaydet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
