'use client';

import { useEffect, useState, useCallback } from 'react';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import {
  createCategory,
  updateCategory,
  getCategories,
} from '@/services/category-service';
import { getSetting } from '@/services/setting-service';
import {
  getVapiAiAssistants,
  getVapiPhoneNumbers,
} from '@/services/vapi-service';
import { ArrowRight, Loader2, X } from 'lucide-react';
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
import { SelectDropdown } from '@/components/select-dropdown';
import type { AiAssistant } from '@/features/vapi/ai-assistants/data/schema';
import type { PhoneNumber } from '@/features/vapi/phone-numbers/data/schema';
import {
  type Category,
  type FieldMapping,
  type LeadFormField,
  type FacebookLeadForm,
  CUSTOMER_FIELDS,
} from '../data/schema';

const formSchema = z.object({
  title: z.string().min(1, 'Kategori adı gereklidir.'),
  parent_id: z.number().nullable(),
  channel: z.string().nullable(),
  lead_form_id: z.string().nullable(),
  vapi_assistant_id: z.string().nullable(),
  vapi_phone_number_id: z.string().nullable(),
  is_global: z.boolean(),
  isEdit: z.boolean(),
});
type CategoryForm = z.infer<typeof formSchema>;

type CategoryActionDialogProps = {
  currentRow?: Category;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function CategoriesActionDialog({
  currentRow,
  open,
  onOpenChange,
  onSuccess,
}: CategoryActionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstCommunication, setIsFirstCommunication] = useState(false);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [facebookLeadForms, setFacebookLeadForms] = useState<
    FacebookLeadForm[]
  >([]);
  const [leadFormFields, setLeadFormFields] = useState<LeadFormField[]>([]);
  const [loadingLeadForms, setLoadingLeadForms] = useState(false);
  const [loadingFormFields, setLoadingFormFields] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: getSetting,
  });

  const { data: vapiAssistants = [] } = useQuery({
    queryKey: ['vapi-assistants'],
    queryFn: getVapiAiAssistants,
    enabled: !!settings?.vapi_settings,
  });

  const { data: vapiPhoneNumbers = [] } = useQuery({
    queryKey: ['vapi-phone-numbers'],
    queryFn: getVapiPhoneNumbers,
    enabled: !!settings?.vapi_settings,
  });

  const isEdit = !!currentRow;
  const form = useForm<CategoryForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          title: currentRow.title,
          parent_id: currentRow.parent_id,
          channel: currentRow.channel,
          lead_form_id: currentRow.lead_form_id,
          vapi_assistant_id: currentRow.vapi_assistant_id,
          vapi_phone_number_id: currentRow.vapi_phone_number_id,
          is_global: currentRow.is_global,
          isEdit,
        }
      : {
          title: '',
          parent_id: null,
          channel: null,
          lead_form_id: null,
          vapi_assistant_id: null,
          vapi_phone_number_id: null,
          is_global: false,
          isEdit,
        },
  });

  const watchChannel = form.watch('channel');
  const watchLeadFormId = form.watch('lead_form_id');

  // Facebook Lead Forms yükleme
  const fetchFacebookLeadForms = useCallback(async (accessToken: string) => {
    setLoadingLeadForms(true);
    try {
      const pagesResponse = await fetch(
        `https://graph.facebook.com/v24.0/me/accounts?access_token=${accessToken}&fields=id,name,access_token`
      );
      const pagesData = await pagesResponse.json();

      if (pagesData.error) {
        throw new Error(
          pagesData.error?.message || 'Facebook sayfaları alınamadı.'
        );
      }

      if (!Array.isArray(pagesData.data) || pagesData.data.length === 0) {
        setFacebookLeadForms([]);
        setLoadingLeadForms(false);
        return;
      }

      const allLeadForms: FacebookLeadForm[] = [];

      for (const page of pagesData.data) {
        try {
          const pageAccessToken = page.access_token || accessToken;

          const subscribedResponse = await fetch(
            `https://graph.facebook.com/v24.0/${page.id}/subscribed_apps?access_token=${pageAccessToken}`
          );
          const subscribedData = await subscribedResponse.json();

          if (!subscribedData.data || subscribedData.data.length === 0) {
            continue;
          }

          const hasLeadgenPermission = subscribedData.data.some(
            (app: { subscribed_fields?: string[] }) =>
              app.subscribed_fields && app.subscribed_fields.includes('leadgen')
          );

          if (!hasLeadgenPermission) {
            continue;
          }

          const formsResponse = await fetch(
            `https://graph.facebook.com/v24.0/${page.id}/leadgen_forms?access_token=${pageAccessToken}&fields=id,name,status`
          );
          const formsData = await formsResponse.json();

          if (formsData.error) {
            continue;
          }

          if (Array.isArray(formsData.data)) {
            const activeForms = formsData.data
              .filter((form: { status: string }) => form.status === 'ACTIVE')
              .map((form: { id: string; name: string }) => ({
                id: form.id,
                name: `${form.name} (${page.name})`,
                pageName: page.name,
                pageId: page.id,
              }));

            allLeadForms.push(...activeForms);
          }
        } catch {
          continue;
        }
      }

      setFacebookLeadForms(allLeadForms);
    } catch {
      setFacebookLeadForms([]);
    } finally {
      setLoadingLeadForms(false);
    }
  }, []);

  // Lead Form alanlarını yükleme
  const fetchLeadFormFields = useCallback(
    async (formId: string) => {
      if (!settings?.facebook_settings?.access_token) return;

      setLoadingFormFields(true);
      try {
        const response = await fetch(
          `https://graph.facebook.com/v24.0/${formId}?access_token=${settings.facebook_settings.access_token}&fields=questions`
        );
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error.message);
        }

        const fields: LeadFormField[] =
          data.questions?.map(
            (q: { key: string; label: string; type?: string }) => ({
              key: q.key,
              label: q.label,
              type: q.type,
            })
          ) || [];

        setLeadFormFields(fields);
      } catch {
        setLeadFormFields([]);
      } finally {
        setLoadingFormFields(false);
      }
    },
    [settings?.facebook_settings?.access_token]
  );

  // Settings değiştiğinde Facebook Lead Forms yükle
  useEffect(() => {
    if (settings?.facebook_settings?.access_token) {
      fetchFacebookLeadForms(settings.facebook_settings.access_token);
    }
  }, [settings?.facebook_settings?.access_token, fetchFacebookLeadForms]);

  // Edit modunda veya dialog açıldığında state'leri ayarla
  useEffect(() => {
    if (open) {
      if (isEdit && currentRow) {
        setIsFirstCommunication(!!currentRow.channel);
        setFieldMappings(currentRow.field_mappings || []);

        // Lead form alanlarını yükle
        if (
          currentRow.lead_form_id &&
          settings?.facebook_settings?.access_token
        ) {
          fetchLeadFormFields(currentRow.lead_form_id);
        }
      } else {
        setIsFirstCommunication(false);
        setFieldMappings([]);
        setLeadFormFields([]);
      }
    }
  }, [
    isEdit,
    currentRow,
    open,
    settings?.facebook_settings?.access_token,
    fetchLeadFormFields,
  ]);

  // Lead form değiştiğinde alanları yükle
  useEffect(() => {
    if (watchLeadFormId && settings?.facebook_settings?.access_token) {
      fetchLeadFormFields(watchLeadFormId);
    } else {
      setLeadFormFields([]);
      setFieldMappings([]);
    }
  }, [
    watchLeadFormId,
    settings?.facebook_settings?.access_token,
    fetchLeadFormFields,
  ]);

  // İlk iletişim kapatıldığında channel ve vapi alanlarını temizle
  useEffect(() => {
    if (!isFirstCommunication) {
      form.setValue('channel', null);
      form.setValue('vapi_assistant_id', null);
      form.setValue('vapi_phone_number_id', null);
    }
  }, [isFirstCommunication, form]);

  // Channel değiştiğinde vapi alanlarını temizle
  useEffect(() => {
    if (watchChannel !== 'phone') {
      form.setValue('vapi_assistant_id', null);
      form.setValue('vapi_phone_number_id', null);
    }
  }, [watchChannel, form]);

  const handleFieldMappingChange = (
    fieldKey: string,
    fieldLabel: string,
    mapTo: string
  ) => {
    setFieldMappings((prev) => {
      const filtered = prev.filter((m) => m.field_key !== fieldKey);
      if (mapTo) {
        return [
          ...filtered,
          { field_key: fieldKey, field_label: fieldLabel, map_to: mapTo },
        ];
      }
      return filtered;
    });
  };

  const onSubmit = async (values: CategoryForm) => {
    try {
      // Telefon kanalı için validasyon
      if (isFirstCommunication && values.channel === 'phone') {
        if (!values.vapi_assistant_id) {
          toast.error('Hata', {
            description: 'Telefon kanalı için asistan seçimi zorunludur.',
          });
          return;
        }
        if (!values.vapi_phone_number_id) {
          toast.error('Hata', {
            description:
              'Telefon kanalı için telefon numarası seçimi zorunludur.',
          });
          return;
        }
      }

      setIsLoading(true);
      const payload = {
        ...values,
        channel: isFirstCommunication ? values.channel : null,
        vapi_assistant_id:
          isFirstCommunication && values.channel === 'phone'
            ? values.vapi_assistant_id
            : null,
        vapi_phone_number_id:
          isFirstCommunication && values.channel === 'phone'
            ? values.vapi_phone_number_id
            : null,
        lead_form_id: values.lead_form_id || '',
        field_mappings: fieldMappings,
      };

      if (isEdit && currentRow) {
        await updateCategory(currentRow.id, payload);
        toast.success('Kategori güncellendi', {
          description: `${values.title} kategori başarıyla güncellendi.`,
        });
      } else {
        await createCategory(payload);
        toast.success('Kategori eklendi', {
          description: `${values.title} kategori başarıyla eklendi.`,
        });
      }

      form.reset();
      setFieldMappings([]);
      setLeadFormFields([]);
      setIsFirstCommunication(false);
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

  const channelOptions = [
    {
      value: 'whatsapp',
      label: 'WhatsApp',
      disabled: !settings?.whatsapp_settings,
    },
    {
      value: 'sms',
      label: 'SMS',
      disabled: !settings?.sms_settings,
    },
    {
      value: 'email',
      label: 'E-Posta',
      disabled: !settings?.mail_settings,
    },
    {
      value: 'phone',
      label: 'Telefon Araması',
      disabled: !settings?.vapi_settings,
    },
  ];

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset();
        setFieldMappings([]);
        setLeadFormFields([]);
        setIsFirstCommunication(false);
        onOpenChange(state);
      }}
    >
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-4xl">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {isEdit ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Kategorinı burada güncelleyin. '
              : 'Yeni kategorinı burada oluşturun. '}
            İşlem tamamlandığında kaydet'e tıklayın.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <Form {...form}>
            <form
              id="category-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 px-0.5"
            >
              {/* Kategori Adı */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Kategori Adı</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Kategori Adı"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Üst Kategori */}
              <FormField
                control={form.control}
                name="parent_id"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Üst Kategori</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <SelectDropdown
                          defaultValue={field.value?.toString() || ''}
                          onValueChange={(value) => {
                            field.onChange(value ? parseInt(value, 10) : null);
                          }}
                          placeholder="Üst kategori seçin (opsiyonel)"
                          items={categories
                            .filter(
                              (cat: Category) =>
                                !isEdit || cat.id !== currentRow?.id
                            )
                            .map((cat: Category) => ({
                              value: String(cat.id),
                              label: cat.title,
                            }))}
                          isControlled={true}
                          className="w-full"
                        />
                      </FormControl>
                      {field.value && (
                        <button
                          type="button"
                          onClick={() => field.onChange(null)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-200"
                          aria-label="Üst kategoriyi kaldır"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* İlk İletişim Switch */}
              <FormField
                control={form.control}
                name="channel"
                render={() => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>İlk İletişim</FormLabel>
                      <div className="text-muted-foreground text-sm">
                        Bu kategori için iletişim tanımlayın
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={isFirstCommunication}
                        onCheckedChange={setIsFirstCommunication}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Kanal Seçimi */}
              {isFirstCommunication && (
                <FormField
                  control={form.control}
                  name="channel"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Kanal</FormLabel>
                      <FormControl>
                        <SelectDropdown
                          defaultValue={field.value || ''}
                          onValueChange={(value) => {
                            field.onChange(value || null);
                          }}
                          placeholder="İletişim kanalı seçin"
                          items={channelOptions.filter((opt) => !opt.disabled)}
                          isControlled={true}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* VAPI Asistan Seçimi */}
              {isFirstCommunication && watchChannel === 'phone' && (
                <FormField
                  control={form.control}
                  name="vapi_assistant_id"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Asistan</FormLabel>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <SelectDropdown
                            defaultValue={field.value || ''}
                            onValueChange={(value) => {
                              field.onChange(value || null);
                            }}
                            placeholder="Asistan seçin"
                            items={(vapiAssistants as AiAssistant[]).map(
                              (assistant) => ({
                                value: assistant.id,
                                label: assistant.name,
                              })
                            )}
                            isControlled={true}
                            className="w-full"
                          />
                        </FormControl>
                        {field.value && (
                          <button
                            type="button"
                            onClick={() => field.onChange(null)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-200"
                            aria-label="Asistanı kaldır"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* VAPI Telefon Numarası Seçimi */}
              {isFirstCommunication && watchChannel === 'phone' && (
                <FormField
                  control={form.control}
                  name="vapi_phone_number_id"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Telefon Numarası</FormLabel>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <SelectDropdown
                            defaultValue={field.value || ''}
                            onValueChange={(value) => {
                              field.onChange(value || null);
                            }}
                            placeholder="Telefon numarası seçin"
                            items={(vapiPhoneNumbers as PhoneNumber[]).map(
                              (phone) => ({
                                value: phone.id,
                                label: phone.name || phone.number,
                              })
                            )}
                            isControlled={true}
                            className="w-full"
                          />
                        </FormControl>
                        {field.value && (
                          <button
                            type="button"
                            onClick={() => field.onChange(null)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-200"
                            aria-label="Telefon numarasını kaldır"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Lead Form Seçimi */}
              <FormField
                control={form.control}
                name="lead_form_id"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Lead Form</FormLabel>
                    {settings?.facebook_settings?.access_token &&
                    facebookLeadForms.length > 0 ? (
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <SelectDropdown
                            defaultValue={field.value || ''}
                            onValueChange={(value) => {
                              field.onChange(value || null);
                              if (!value) {
                                setFieldMappings([]);
                                setLeadFormFields([]);
                              }
                            }}
                            placeholder={
                              loadingLeadForms
                                ? 'Yükleniyor...'
                                : 'Lead Form seçin'
                            }
                            items={facebookLeadForms.map((form) => ({
                              value: form.id,
                              label: form.name,
                            }))}
                            isControlled={true}
                            className="w-full"
                          />
                        </FormControl>
                        {field.value && (
                          <button
                            type="button"
                            onClick={() => {
                              field.onChange(null);
                              setFieldMappings([]);
                              setLeadFormFields([]);
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-200"
                            aria-label="Lead Form'u kaldır"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <FormControl>
                        <Input
                          placeholder="Lead Form ID"
                          autoComplete="off"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                    )}
                    {!settings?.facebook_settings?.access_token && (
                      <p className="text-muted-foreground text-sm">
                        Facebook entegrasyonu aktif değil. Lead Form ID'yi
                        manuel olarak girebilirsiniz.
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Alan Eşleştirmeleri */}
              {watchLeadFormId && leadFormFields.length > 0 && (
                <div className="space-y-3">
                  <FormLabel>Alan Eşleştirmeleri</FormLabel>
                  {loadingFormFields ? (
                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Form alanları yükleniyor...</span>
                    </div>
                  ) : (
                    <div className="space-y-3 rounded-lg border p-3">
                      {leadFormFields.map((field) => {
                        const existingMapping = fieldMappings.find(
                          (m) => m.field_key === field.key
                        );
                        return (
                          <div
                            key={field.key}
                            className="flex flex-col gap-2 sm:flex-row sm:items-center"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">
                                {field.label}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                ({field.key})
                              </p>
                            </div>
                            <ArrowRight className="text-muted-foreground hidden h-4 w-4 shrink-0 sm:block" />
                            <div className="flex-1">
                              <SelectDropdown
                                defaultValue={existingMapping?.map_to || ''}
                                onValueChange={(value) => {
                                  handleFieldMappingChange(
                                    field.key,
                                    field.label,
                                    value
                                  );
                                }}
                                placeholder="Alan seçin"
                                items={CUSTOMER_FIELDS.map((f) => ({
                                  value: f.value,
                                  label: f.label,
                                }))}
                                isControlled={true}
                                className="w-full"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Global Switch */}
              <FormField
                control={form.control}
                name="is_global"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Global</FormLabel>
                      <div className="text-muted-foreground text-sm">
                        Bu kategori global olarak kullanılsın mı?
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

        <DialogFooter className="flex-shrink-0 border-t pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            İptal
          </Button>
          <Button type="submit" form="category-form" disabled={isLoading}>
            {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
