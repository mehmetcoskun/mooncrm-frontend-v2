import { useCallback, useEffect, useState } from 'react';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getSetting, updateOrCreateSetting } from '@/services/setting-service';
import { languages } from 'countries-list';
import {
  Mail,
  MessageCircle,
  MessageSquareText,
  Phone,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

const messageSchema = z.object({
  language: z.string().min(1, 'Dil seçimi gereklidir.'),
  message: z.string().min(1, 'Mesaj gereklidir.'),
  is_default: z.boolean(),
});

const whatsappSchema = z.object({
  status: z.boolean(),
  start_time: z.string().min(1, 'Başlangıç saati gereklidir.'),
  end_time: z.string().min(1, 'Bitiş saati gereklidir.'),
  file: z
    .object({
      type: z.string().nullable(),
      content: z.string().nullable(),
    })
    .nullable()
    .optional(),
  messages: z.array(messageSchema).min(1, 'En az bir mesaj eklenmelidir.'),
});
type WhatsappForm = z.infer<typeof whatsappSchema>;

const smsSchema = z.object({
  status: z.boolean(),
  start_time: z.string().min(1, 'Başlangıç saati gereklidir.'),
  end_time: z.string().min(1, 'Bitiş saati gereklidir.'),
  messages: z.array(messageSchema).min(1, 'En az bir mesaj eklenmelidir.'),
});
type SmsForm = z.infer<typeof smsSchema>;

const emailSchema = z.object({
  status: z.boolean(),
  start_time: z.string().min(1, 'Başlangıç saati gereklidir.'),
  end_time: z.string().min(1, 'Bitiş saati gereklidir.'),
  messages: z.array(messageSchema).min(1, 'En az bir mesaj eklenmelidir.'),
});
type EmailForm = z.infer<typeof emailSchema>;

const phoneSchema = z.object({
  status: z.boolean(),
  start_time: z.string().min(1, 'Başlangıç saati gereklidir.'),
  end_time: z.string().min(1, 'Bitiş saati gereklidir.'),
});
type PhoneForm = z.infer<typeof phoneSchema>;

interface WelcomeMessageSettingsSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WelcomeMessageSettingsSidebar({
  open,
  onOpenChange,
}: WelcomeMessageSettingsSidebarProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{
    type: string;
    content: string;
  } | null>(null);

  const languageOptions = Object.entries(languages).map(([code, lang]) => ({
    value: code.toLowerCase(),
    label: lang.name,
  }));

  const whatsappForm = useForm<WhatsappForm>({
    resolver: zodResolver(whatsappSchema),
    defaultValues: {
      status: false,
      start_time: '',
      end_time: '',
      file: null,
      messages: [],
    },
  });

  const {
    fields: whatsappFields,
    append: whatsappAppend,
    remove: whatsappRemove,
  } = useFieldArray({
    control: whatsappForm.control,
    name: 'messages',
  });

  const smsForm = useForm<SmsForm>({
    resolver: zodResolver(smsSchema),
    defaultValues: {
      status: false,
      start_time: '',
      end_time: '',
      messages: [],
    },
  });

  const {
    fields: smsFields,
    append: smsAppend,
    remove: smsRemove,
  } = useFieldArray({
    control: smsForm.control,
    name: 'messages',
  });

  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      status: false,
      start_time: '',
      end_time: '',
      messages: [],
    },
  });

  const {
    fields: emailFields,
    append: emailAppend,
    remove: emailRemove,
  } = useFieldArray({
    control: emailForm.control,
    name: 'messages',
  });

  const phoneForm = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      status: false,
      start_time: '',
      end_time: '',
    },
  });

  const loadSettings = useCallback(async () => {
    try {
      setIsFetching(true);
      const settings = await getSetting();

      if (settings?.welcome_message_settings?.whatsapp) {
        const whatsapp = settings.welcome_message_settings.whatsapp;

        whatsappForm.reset({
          status: whatsapp.status ?? false,
          start_time: whatsapp.start_time || '',
          end_time: whatsapp.end_time || '',
          file: whatsapp.file || null,
          messages: whatsapp.messages || [],
        });

        if (whatsapp.file?.content) {
          setUploadedFile(whatsapp.file);
        }
      }

      if (settings?.welcome_message_settings?.sms) {
        const sms = settings.welcome_message_settings.sms;

        smsForm.reset({
          status: sms.status ?? false,
          start_time: sms.start_time || '',
          end_time: sms.end_time || '',
          messages: sms.messages || [],
        });
      }

      if (settings?.welcome_message_settings?.email) {
        const email = settings.welcome_message_settings.email;

        emailForm.reset({
          status: email.status ?? false,
          start_time: email.start_time || '',
          end_time: email.end_time || '',
          messages: email.messages || [],
        });
      }

      if (settings?.welcome_message_settings?.phone) {
        const phone = settings.welcome_message_settings.phone;

        phoneForm.reset({
          status: phone.status ?? false,
          start_time: phone.start_time || '',
          end_time: phone.end_time || '',
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
  }, [whatsappForm, smsForm, emailForm, phoneForm]);

  useEffect(() => {
    if (open) {
      loadSettings();
    }
  }, [open, loadSettings]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 1048576) {
      toast.error('Hata', {
        description: "Dosya boyutu 1MB'dan büyük olamaz.",
      });
      return;
    }

    const validTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/pdf',
    ];
    if (!validTypes.includes(file.type)) {
      toast.error('Hata', {
        description: 'Sadece resim (JPEG, PNG) ve PDF dosyaları yüklenebilir.',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64WithPrefix = reader.result as string;
      const base64 = base64WithPrefix.split(',')[1];
      const fileData = {
        type: file.type.startsWith('image') ? 'image' : 'pdf',
        content: base64,
      };
      setUploadedFile(fileData);
      whatsappForm.setValue('file', fileData);
    };
    reader.readAsDataURL(file);
  };

  const onWhatsappSubmit = async (values: WhatsappForm) => {
    try {
      setIsLoading(true);

      const response = await updateOrCreateSetting({
        welcome_message_settings: {
          whatsapp: values,
        },
      });

      toast.success('Başarılı', {
        description:
          response?.message ||
          'WhatsApp karşılama mesajı başarıyla kaydedildi.',
      });
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

  const onSmsSubmit = async (values: SmsForm) => {
    try {
      setIsLoading(true);

      const response = await updateOrCreateSetting({
        welcome_message_settings: {
          sms: values,
        },
      });

      toast.success('Başarılı', {
        description:
          response?.message || 'SMS karşılama mesajı başarıyla kaydedildi.',
      });
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

  const onEmailSubmit = async (values: EmailForm) => {
    try {
      setIsLoading(true);

      const response = await updateOrCreateSetting({
        welcome_message_settings: {
          email: values,
        },
      });

      toast.success('Başarılı', {
        description:
          response?.message || 'E-Posta karşılama mesajı başarıyla kaydedildi.',
      });
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

  const onPhoneSubmit = async (values: PhoneForm) => {
    try {
      setIsLoading(true);

      const response = await updateOrCreateSetting({
        welcome_message_settings: {
          phone: values,
        },
      });

      toast.success('Başarılı', {
        description:
          response?.message || 'Telefon araması ayarları başarıyla kaydedildi.',
      });
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto p-4 sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <MessageSquareText className="h-5 w-5" />
            Karşılama Mesaj Ayarları
          </SheetTitle>
          <SheetDescription>
            Otomatik karşılama mesajlarını yapılandırın.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <Tabs defaultValue="whatsapp" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="whatsapp" className="text-xs">
                <MessageCircle className="mr-1 h-3 w-3" />
                WhatsApp
              </TabsTrigger>
              <TabsTrigger value="sms" className="text-xs">
                <MessageSquareText className="mr-1 h-3 w-3" />
                SMS
              </TabsTrigger>
              <TabsTrigger value="email" className="text-xs">
                <Mail className="mr-1 h-3 w-3" />
                E-Posta
              </TabsTrigger>
              <TabsTrigger value="phone" className="text-xs">
                <Phone className="mr-1 h-3 w-3" />
                Telefon
              </TabsTrigger>
            </TabsList>

            <TabsContent value="whatsapp" className="mt-4 space-y-4">
              <Form {...whatsappForm}>
                <form
                  onSubmit={whatsappForm.handleSubmit(onWhatsappSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={whatsappForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Aktif</FormLabel>
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

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={whatsappForm.control}
                      name="start_time"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-sm">
                            Başlangıç Saati
                          </FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={whatsappForm.control}
                      name="end_time"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-sm">Bitiş Saati</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <FormLabel className="text-sm">Medya</FormLabel>
                    <div className="rounded-lg border p-3">
                      <div className="flex gap-2">
                        <Input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="whatsapp-file-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() =>
                            document
                              .getElementById('whatsapp-file-upload')
                              ?.click()
                          }
                        >
                          <Upload className="mr-1 h-3 w-3" />
                          Dosya Seç
                        </Button>
                        {uploadedFile && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              setUploadedFile(null);
                              whatsappForm.setValue('file', null);
                            }}
                          >
                            Sil
                          </Button>
                        )}
                      </div>
                      <p className="text-muted-foreground mt-2 text-xs">
                        Dosyaları sürükleyip bırakın ya da seçin.
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Maksimum dosya boyutu: 1MB. İzin verilen formatlar:
                        Resim ve PDF
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="space-y-3">
                      {whatsappFields.map((field, index) => (
                        <div
                          key={field.id}
                          className="space-y-3 rounded-lg border p-3"
                        >
                          <div className="flex items-center justify-end gap-2">
                            <FormField
                              control={whatsappForm.control}
                              name={`messages.${index}.is_default`}
                              render={({ field }) => (
                                <FormItem className="flex items-center space-y-0 space-x-1">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          whatsappFields.forEach((_, i) => {
                                            if (i !== index) {
                                              whatsappForm.setValue(
                                                `messages.${i}.is_default`,
                                                false
                                              );
                                            }
                                          });
                                        }
                                        field.onChange(checked);
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="cursor-pointer text-xs font-normal">
                                    Varsayılan
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                            {whatsappFields.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => whatsappRemove(index)}
                              >
                                <Trash2 className="text-destructive h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          <FormField
                            control={whatsappForm.control}
                            name={`messages.${index}.language`}
                            render={({ field }) => (
                              <FormItem className="space-y-1.5">
                                <FormLabel className="text-xs">Dil</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Dil seçin" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {languageOptions.map((lang) => (
                                      <SelectItem
                                        key={lang.value}
                                        value={lang.value}
                                      >
                                        {lang.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={whatsappForm.control}
                            name={`messages.${index}.message`}
                            render={({ field }) => (
                              <FormItem className="space-y-1.5">
                                <FormLabel className="text-xs">Mesaj</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Karşılama mesajını girin"
                                    className="min-h-[80px] text-xs"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      ))}
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() =>
                        whatsappAppend({
                          language: 'en',
                          message: '',
                          is_default: false,
                        })
                      }
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Ekle
                    </Button>

                    <p className="text-muted-foreground text-xs">
                      <strong>Not:</strong> Mesaj içerisinde {'{name}'}{' '}
                      parametresini müşterinin adı, {'{user}'} parametresini
                      danışmanın adı ile değiştirilecektir.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || isFetching}
                  >
                    {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="sms" className="mt-4 space-y-4">
              <Form {...smsForm}>
                <form
                  onSubmit={smsForm.handleSubmit(onSmsSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={smsForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Aktif</FormLabel>
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

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={smsForm.control}
                      name="start_time"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-sm">
                            Başlangıç Saati
                          </FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={smsForm.control}
                      name="end_time"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-sm">Bitiş Saati</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="space-y-3">
                      {smsFields.map((field, index) => (
                        <div
                          key={field.id}
                          className="space-y-3 rounded-lg border p-3"
                        >
                          <div className="flex items-center justify-end gap-2">
                            <FormField
                              control={smsForm.control}
                              name={`messages.${index}.is_default`}
                              render={({ field }) => (
                                <FormItem className="flex items-center space-y-0 space-x-1">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          smsFields.forEach((_, i) => {
                                            if (i !== index) {
                                              smsForm.setValue(
                                                `messages.${i}.is_default`,
                                                false
                                              );
                                            }
                                          });
                                        }
                                        field.onChange(checked);
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="cursor-pointer text-xs font-normal">
                                    Varsayılan
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                            {smsFields.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => smsRemove(index)}
                              >
                                <Trash2 className="text-destructive h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          <FormField
                            control={smsForm.control}
                            name={`messages.${index}.language`}
                            render={({ field }) => (
                              <FormItem className="space-y-1.5">
                                <FormLabel className="text-xs">Dil</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Dil seçin" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {languageOptions.map((lang) => (
                                      <SelectItem
                                        key={lang.value}
                                        value={lang.value}
                                      >
                                        {lang.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={smsForm.control}
                            name={`messages.${index}.message`}
                            render={({ field }) => (
                              <FormItem className="space-y-1.5">
                                <FormLabel className="text-xs">Mesaj</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Karşılama mesajını girin"
                                    className="min-h-[80px] text-xs"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      ))}
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() =>
                        smsAppend({
                          language: 'en',
                          message: '',
                          is_default: false,
                        })
                      }
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Ekle
                    </Button>

                    <p className="text-muted-foreground text-xs">
                      <strong>Not:</strong> Mesaj içerisinde {'{name}'}{' '}
                      parametresini müşterinin adı, {'{user}'} parametresini
                      danışmanın adı ile değiştirilecektir.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || isFetching}
                  >
                    {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="email" className="mt-4 space-y-4">
              <Form {...emailForm}>
                <form
                  onSubmit={emailForm.handleSubmit(onEmailSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={emailForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Aktif</FormLabel>
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

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={emailForm.control}
                      name="start_time"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-sm">
                            Başlangıç Saati
                          </FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={emailForm.control}
                      name="end_time"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-sm">Bitiş Saati</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="space-y-3">
                      {emailFields.map((field, index) => (
                        <div
                          key={field.id}
                          className="space-y-3 rounded-lg border p-3"
                        >
                          <div className="flex items-center justify-end gap-2">
                            <FormField
                              control={emailForm.control}
                              name={`messages.${index}.is_default`}
                              render={({ field }) => (
                                <FormItem className="flex items-center space-y-0 space-x-1">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          emailFields.forEach((_, i) => {
                                            if (i !== index) {
                                              emailForm.setValue(
                                                `messages.${i}.is_default`,
                                                false
                                              );
                                            }
                                          });
                                        }
                                        field.onChange(checked);
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="cursor-pointer text-xs font-normal">
                                    Varsayılan
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                            {emailFields.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => emailRemove(index)}
                              >
                                <Trash2 className="text-destructive h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          <FormField
                            control={emailForm.control}
                            name={`messages.${index}.language`}
                            render={({ field }) => (
                              <FormItem className="space-y-1.5">
                                <FormLabel className="text-xs">Dil</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Dil seçin" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {languageOptions.map((lang) => (
                                      <SelectItem
                                        key={lang.value}
                                        value={lang.value}
                                      >
                                        {lang.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={emailForm.control}
                            name={`messages.${index}.message`}
                            render={({ field }) => (
                              <FormItem className="space-y-1.5">
                                <FormLabel className="text-xs">Mesaj</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Karşılama mesajını girin"
                                    className="min-h-[80px] text-xs"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      ))}
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() =>
                        emailAppend({
                          language: 'en',
                          message: '',
                          is_default: false,
                        })
                      }
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Ekle
                    </Button>

                    <p className="text-muted-foreground text-xs">
                      <strong>Not:</strong> Mesaj içerisinde {'{name}'}{' '}
                      parametresini müşterinin adı, {'{user}'} parametresini
                      danışmanın adı ile değiştirilecektir.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || isFetching}
                  >
                    {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="phone" className="mt-4 space-y-4">
              <Form {...phoneForm}>
                <form
                  onSubmit={phoneForm.handleSubmit(onPhoneSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={phoneForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Aktif</FormLabel>
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

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={phoneForm.control}
                      name="start_time"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-sm">
                            Başlangıç Saati
                          </FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={phoneForm.control}
                      name="end_time"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-sm">Bitiş Saati</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <p className="text-muted-foreground text-xs">
                    <strong>Not:</strong> Telefon araması ayarları sadece
                    belirtilen saat aralığında aktif olacaktır.
                  </p>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || isFetching}
                  >
                    {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
