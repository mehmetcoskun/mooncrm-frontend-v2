'use client';

import { useState } from 'react';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { getVapiAiAssistants, callPhone } from '@/services/vapi-service';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type AiAssistant } from '@/features/vapi/ai-assistants/data/schema';
import { type PhoneNumber } from '../data/schema';

const formSchema = z.object({
  assistantId: z.string().min(1, 'Asistan seçimi zorunludur.'),
  phoneNumber: z.string().min(1, 'Telefon numarası zorunludur.'),
});
type CallForm = z.infer<typeof formSchema>;

type PhoneNumberCallDialogProps = {
  currentRow: PhoneNumber;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function PhoneNumbersCallDialog({
  currentRow,
  open,
  onOpenChange,
  onSuccess,
}: PhoneNumberCallDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const { data: assistants = [] } = useQuery({
    queryKey: ['vapiAiAssistants'],
    queryFn: getVapiAiAssistants,
    enabled: open,
  });

  const form = useForm<CallForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assistantId: '',
      phoneNumber: '',
    },
  });

  const onSubmit = async (values: CallForm) => {
    try {
      setIsLoading(true);

      const callPayload = {
        assistantId: values.assistantId,
        customer: {
          number: values.phoneNumber,
        },
        phoneNumberId: currentRow.id,
      };

      await callPhone(callPayload);
      toast.success('Arama başlatıldı', {
        description: 'Arama başarıyla başlatıldı.',
      });

      form.reset();
      onOpenChange(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error('Hata', {
        description: `Arama başlatılırken bir hata oluştu: ${error instanceof AxiosError ? error.response?.data.message : 'Bilinmeyen hata'}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!isLoading) {
          form.reset();
          onOpenChange(state);
        }
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle>Arama Yap</DialogTitle>
          <DialogDescription>
            Telefon numarasını ve asistanı seçerek arama yapabilirsiniz.
          </DialogDescription>
        </DialogHeader>
        <div className="py-1">
          <Form {...form}>
            <form
              id="call-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 px-0.5"
            >
              <FormField
                control={form.control}
                name="assistantId"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Asistan</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Asistan seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {assistants.map((assistant: AiAssistant) => (
                          <SelectItem key={assistant.id} value={assistant.id}>
                            {assistant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Telefon Numarası</FormLabel>
                    <FormControl>
                      <PhoneInput
                        defaultCountry="tr"
                        value={field.value}
                        onChange={field.onChange}
                        inputClassName="w-full"
                      />
                    </FormControl>
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
          <Button type="submit" form="call-form" disabled={isLoading}>
            {isLoading ? 'Aranıyor...' : 'Ara'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
