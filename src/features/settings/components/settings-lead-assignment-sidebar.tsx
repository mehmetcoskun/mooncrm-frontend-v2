import { useCallback, useEffect, useState } from 'react';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getSetting, updateOrCreateSetting } from '@/services/setting-service';
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

const formSchema = z.object({
  strategy: z.enum(['sequential', 'working_hours']),
});
type SettingsLeadAssignmentForm = z.infer<typeof formSchema>;

interface SettingsLeadAssignmentSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsLeadAssignmentSidebar({
  open,
  onOpenChange,
}: SettingsLeadAssignmentSidebarProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const form = useForm<SettingsLeadAssignmentForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      strategy: 'sequential',
    },
  });

  const loadSettings = useCallback(async () => {
    try {
      setIsFetching(true);
      const settings = await getSetting();

      if (settings?.lead_assignment_settings) {
        const assignmentSettings = settings.lead_assignment_settings;

        form.reset({
          strategy: assignmentSettings.strategy || 'sequential',
        });
      }
    } catch (error) {
      toast.error('Hata', {
        description:
          error instanceof AxiosError
            ? error.response?.data?.message
            : 'Ayarlar yüklenirken bir hata oluştu.',
      });
    } finally {
      setIsFetching(false);
    }
  }, [form]);

  useEffect(() => {
    if (open) {
      loadSettings();
    }
  }, [open, loadSettings]);

  const onSubmit = async (values: SettingsLeadAssignmentForm) => {
    try {
      setIsLoading(true);

      const response = await updateOrCreateSetting({
        lead_assignment_settings: {
          strategy: values.strategy,
        },
      });

      toast.success('Başarılı', {
        description:
          response?.message || 'Lead atama ayarları başarıyla kaydedildi.',
      });

      onOpenChange(false);
    } catch (error) {
      toast.error('Hata', {
        description:
          error instanceof AxiosError
            ? error.response?.data?.message
            : 'Ayarlar kaydedilirken bir hata oluştu.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(state) => {
        form.reset({
          strategy: 'sequential',
        });
        onOpenChange(state);
      }}
    >
      <SheetContent className="w-full overflow-y-auto p-4 sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Lead Atama Strateji Ayarları
          </SheetTitle>
          <SheetDescription>
            Lead dağıtım ve atama stratejilerini belirleyin.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <Form {...form}>
            <form
              id="lead-assignment-settings-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="strategy"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Lead Atama Stratejisi</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="space-y-3"
                      >
                        <div className="hover:bg-accent/50 flex items-start space-x-3 rounded-lg border p-4">
                          <RadioGroupItem value="sequential" id="sequential" />
                          <div className="flex-1 space-y-1">
                            <Label
                              htmlFor="sequential"
                              className="cursor-pointer font-medium"
                            >
                              Sıralı Atama
                            </Label>
                            <p className="text-muted-foreground text-sm">
                              Leadler danışmanlara sırayla atanır.
                            </p>
                          </div>
                        </div>

                        <div className="hover:bg-accent/50 flex items-start space-x-3 rounded-lg border p-4">
                          <RadioGroupItem
                            value="working_hours"
                            id="working_hours"
                          />
                          <div className="flex-1 space-y-1">
                            <Label
                              htmlFor="working_hours"
                              className="cursor-pointer font-medium"
                            >
                              Mesai Saatine Göre Atama
                            </Label>
                            <p className="text-muted-foreground text-sm">
                              Leadler danışmanların mesai saatlerine göre
                              atanır.
                            </p>
                          </div>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  form="lead-assignment-settings-form"
                  disabled={isLoading || isFetching}
                  className="flex-1"
                >
                  {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
