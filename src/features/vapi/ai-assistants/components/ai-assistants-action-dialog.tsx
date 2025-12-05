'use client';

import { useEffect, useState } from 'react';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createVapiAiAssistant,
  updateVapiAiAssistant,
} from '@/services/vapi-service';
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
  FormDescription,
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
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { type AiAssistant } from '../data/schema';

const formSchema = z.object({
  name: z.string().min(1, 'Asistan adı gereklidir.'),
  firstMessage: z.string().optional(),
  firstMessageMode: z.string().optional(),
  systemPrompt: z.string().optional(),
  voiceProvider: z.string().optional(),
  voiceId: z.string().optional(),
  transcriberLanguage: z.string().optional(),
  backgroundDenoisingEnabled: z.boolean().optional(),
  backgroundSound: z.boolean().optional(),
  endCallFunctionEnabled: z.boolean().optional(),
  voicemailMessage: z.string().optional(),
  endCallMessage: z.string().optional(),
  summaryPrompt: z.string().optional(),
  numWords: z.number().optional(),
  voiceSeconds: z.number().optional(),
  backoffSeconds: z.number().optional(),
  isEdit: z.boolean(),
});
type AiAssistantForm = z.infer<typeof formSchema>;

type AiAssistantActionDialogProps = {
  currentRow?: AiAssistant;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

const DEFAULT_SYSTEM_PROMPT = `Sen {{organization}} adlı diş kliniğinin profesyonel randevu asistanısın. Web sitesi veya sosyal medya üzerinden form dolduran hastalar ile iletişim kurarak ön değerlendirme ve randevu planlama görevini üstleniyorsun.

GÖRÜŞME PROTOKOLÜ:

1. KENDİNİ TANIT:
- "Merhaba, ben Ayşe, {{organization}} diş kliniğinden arıyorum"
- Hastanın formunu aldığınızı ve bilgi vermek için aradığınızı belirtin
- Konuşmaya devam edebilip edemeyeceğini nezaketle sorun

2. HASTA BİLGİLERİNİ DOĞRULA:
- Formda belirttiği şikayeti teyit edin
- Ağrı varsa: şiddeti, süresi, tetikleyici faktörler
- Şişlik, kanama gibi ek semptomları sorgulayın

3. TIBBİ GEÇMİŞ:
- Daha önce diş tedavisi geçirip geçirmediği
- Kronik hastalıklar (diyabet, hipertansiyon, kalp hastalığı)
- Düzenli kullandığı ilaçlar
- Gebelik durumu (kadın hastalar için)

4. RANDEVU PLANLAMASI:
- Uygun gün ve saat tercihleri

5. ÖNEMLİ BİLGİLER:
- Randevu öncesi 2 saat aç gelmemesi gerektiği
- Diş fırçalama ve ağız hijyeni önerileri
- Klinik adresi ve ulaşım bilgileri

6. GÖRÜŞME SONU:
- Soruları varsa yanıtlayın
- Randevu bilgilerini tekrarlayın
- İletişim numarasını paylaşın
- Nazik bir şekilde vedalaşın

ÖNEMLİ KURALLAR:
- Asla tıbbi teşhis koymayın veya tedavi önermeyiniz
- Ağrı kesici önermeyin, acil durumlarda diş hekimine yönlendirin
- Her zaman sakin, anlayışlı ve profesyonel konuşun
- Hastanın endişelerini ciddiye alın
- Bilmediğiniz konularda "Doktor bey/hanım size daha detaylı bilgi verecek" deyin`;

const DEFAULT_SUMMARY_PROMPT = `Sen uzman bir not alma asistanısın. Sana bir telefon görüşmesinin transkripti verilecek. Bu görüşmeyi analiz ederek hastanın belirttiği TÜM bilgileri eksiksiz olarak özetle: şikayetleri, semptomları, müsaitlik durumu, tekrar aranma talepleri, verdiği özel bilgiler, endişeleri, soruları ve konuşma sırasında söylediği her türlü önemli detayı kaydet. Hasta başka zaman aranmak istiyorsa hangi gün/saatlerde müsait olduğunu belirt. Sadece hastanın söylediklerini kaydet, kendi yorumunu veya ek bilgi ekleme. Özeti maddeler halinde ve sade bir dille yaz.`;

export function AiAssistantsActionDialog({
  currentRow,
  open,
  onOpenChange,
  onSuccess,
}: AiAssistantActionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const isEdit = !!currentRow;
  const form = useForm<AiAssistantForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          name: currentRow.name || '',
          firstMessage: currentRow.firstMessage || '',
          firstMessageMode:
            currentRow.firstMessageMode || 'assistant-waits-for-user',
          systemPrompt: currentRow.model?.messages?.[0]?.content || '',
          voiceProvider: currentRow.voice?.provider || 'vapi',
          voiceId: currentRow.voice?.voiceId || 'Savannah',
          transcriberLanguage: currentRow.transcriber?.language || 'tr',
          backgroundDenoisingEnabled:
            currentRow.backgroundDenoisingEnabled || false,
          backgroundSound: currentRow.backgroundSound !== 'off',
          endCallFunctionEnabled: currentRow.endCallFunctionEnabled || false,
          voicemailMessage: currentRow.voicemailMessage || '',
          endCallMessage: currentRow.endCallMessage || '',
          summaryPrompt:
            currentRow.analysisPlan?.summaryPlan?.messages?.[0]?.content || '',
          numWords: currentRow.stopSpeakingPlan?.numWords || 0,
          voiceSeconds: currentRow.stopSpeakingPlan?.voiceSeconds || 0.2,
          backoffSeconds: currentRow.stopSpeakingPlan?.backoffSeconds || 1,
          isEdit,
        }
      : {
          name: 'Yeni Asistan',
          firstMessage:
            'Merhaba {{name}}, ben {{organization}} diş kliniğinden arıyorum. doldurduğunuz form için sizi arıyorum. Nasıl yardımcı olabilirim?',
          firstMessageMode: 'assistant-waits-for-user',
          systemPrompt: DEFAULT_SYSTEM_PROMPT,
          voiceProvider: 'vapi',
          voiceId: 'Savannah',
          transcriberLanguage: 'tr',
          backgroundDenoisingEnabled: true,
          backgroundSound: false,
          endCallFunctionEnabled: false,
          voicemailMessage: 'Lütfen müsait olduğunuzda beni geri arayın.',
          endCallMessage: 'Sağlıklı günler dilerim.',
          summaryPrompt: DEFAULT_SUMMARY_PROMPT,
          numWords: 0,
          voiceSeconds: 0.2,
          backoffSeconds: 1,
          isEdit,
        },
  });

  useEffect(() => {
    if (open && currentRow) {
      form.reset({
        name: currentRow.name || '',
        firstMessage: currentRow.firstMessage || '',
        firstMessageMode:
          currentRow.firstMessageMode || 'assistant-waits-for-user',
        systemPrompt: currentRow.model?.messages?.[0]?.content || '',
        voiceProvider: currentRow.voice?.provider || 'vapi',
        voiceId: currentRow.voice?.voiceId || 'Savannah',
        transcriberLanguage: currentRow.transcriber?.language || 'tr',
        backgroundDenoisingEnabled:
          currentRow.backgroundDenoisingEnabled || false,
        backgroundSound: currentRow.backgroundSound !== 'off',
        endCallFunctionEnabled: currentRow.endCallFunctionEnabled || false,
        voicemailMessage: currentRow.voicemailMessage || '',
        endCallMessage: currentRow.endCallMessage || '',
        summaryPrompt:
          currentRow.analysisPlan?.summaryPlan?.messages?.[0]?.content || '',
        numWords: currentRow.stopSpeakingPlan?.numWords || 0,
        voiceSeconds: currentRow.stopSpeakingPlan?.voiceSeconds || 0.2,
        backoffSeconds: currentRow.stopSpeakingPlan?.backoffSeconds || 1,
        isEdit: true,
      });
    }
  }, [open, currentRow, form]);

  const onSubmit = async (values: AiAssistantForm) => {
    try {
      setIsLoading(true);

      const assistantData = {
        name: values.name,
        voice: {
          voiceId: values.voiceId || 'Savannah',
          provider: values.voiceProvider || 'vapi',
        },
        model: {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: values.systemPrompt || DEFAULT_SYSTEM_PROMPT,
            },
          ],
          provider: 'openai',
        },
        firstMessage: values.firstMessage,
        firstMessageMode: values.firstMessageMode,
        voicemailMessage: values.voicemailMessage,
        endCallMessage: values.endCallMessage,
        transcriber: {
          provider: 'deepgram',
          model: 'nova-2',
          language: values.transcriberLanguage || 'tr',
        },
        serverMessages: ['end-of-call-report'],
        analysisPlan: {
          summaryPlan: {
            messages: [
              {
                role: 'system',
                content: values.summaryPrompt || DEFAULT_SUMMARY_PROMPT,
              },
              {
                content:
                  'Here is the transcript:\n\n{{transcript}}\n\n. Here is the ended reason of the call:\n\n{{endedReason}}\n\n',
                role: 'user',
              },
            ],
          },
        },
        server: {
          url: `${import.meta.env.VITE_API_URL}/vapi/webhook`,
          timeoutSeconds: 20,
        },
        backgroundDenoisingEnabled: values.backgroundDenoisingEnabled,
        backgroundSound: values.backgroundSound ? undefined : 'off',
        stopSpeakingPlan: {
          numWords: values.numWords || 0,
          voiceSeconds: values.voiceSeconds || 0.2,
          backoffSeconds: values.backoffSeconds || 1,
        },
        endCallFunctionEnabled: values.endCallFunctionEnabled || undefined,
      };

      if (isEdit && currentRow) {
        await updateVapiAiAssistant(currentRow.id, assistantData);
        toast.success('AI Asistan güncellendi', {
          description: `${values.name} adlı AI asistan başarıyla güncellendi.`,
        });
      } else {
        await createVapiAiAssistant(assistantData);
        toast.success('AI Asistan eklendi', {
          description: `${values.name} adlı AI asistan başarıyla eklendi.`,
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

  const voiceProvider = form.watch('voiceProvider');

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
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-4xl">
        <DialogHeader className="flex-shrink-0 text-start">
          <DialogTitle>
            {isEdit ? 'AI Asistan Düzenle' : 'Yeni AI Asistan Ekle'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'AI asistanı burada güncelleyin. '
              : 'Yeni AI asistanı burada oluşturun. '}
            İşlem tamamlandığında kaydet&apos;e tıklayın.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto py-1">
          <Form {...form}>
            <form
              id="ai-assistant-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 px-0.5"
            >
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="general">Genel</TabsTrigger>
                  <TabsTrigger value="model">Model</TabsTrigger>
                  <TabsTrigger value="voice">Ses</TabsTrigger>
                  <TabsTrigger value="transcriber">Transcriber</TabsTrigger>
                  <TabsTrigger value="advanced">Gelişmiş</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Asistan Adı</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Asistan Adı"
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
                    name="firstMessageMode"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>İlk Mesaj Davranışı</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="assistant-speaks-first">
                              Asistan İlk Konuşur
                            </SelectItem>
                            <SelectItem value="assistant-waits-for-user">
                              Asistan Kullanıcıyı Bekler
                            </SelectItem>
                            <SelectItem value="assistant-speaks-first-with-model-generated-message">
                              Asistan Model Mesajıyla İlk Konuşur
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="firstMessage"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Açılış Mesajı</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Merhaba, nasıl yardımcı olabilirim?"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="voicemailMessage"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Sesli Mesaj</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Müsait olduğunuzda lütfen geri arayın."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Çağrı sesli mesaja yönlendirilirse asistanın
                          söyleyeceği mesaj.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endCallMessage"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Arama Sonu Mesajı</FormLabel>
                        <FormControl>
                          <Input placeholder="Hoşçakalın." {...field} />
                        </FormControl>
                        <FormDescription>
                          Arama sonlandırılırsa asistanın söyleyeceği mesaj.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="model" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="systemPrompt"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Sistem Talimatları</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Sen yardımsever bir AI asistanısın..."
                            rows={20}
                            className="font-mono text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          AI asistanının davranışını, kişiliğini ve görevlerini
                          burada tanımlayın.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="summaryPrompt"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Özet Talimatları</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Bir görüşmenin transkriptini alacaksın..."
                            rows={5}
                            className="font-mono text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Görüşme sonunda AI&apos;ın nasıl bir özet çıkarması
                          gerektiğini belirleyin.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="voice" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="voiceProvider"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Ses Sağlayıcısı</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="vapi">VAPI</SelectItem>
                            <SelectItem value="11labs">11Labs</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {voiceProvider === 'vapi' && (
                    <FormField
                      control={form.control}
                      name="voiceId"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>Ses Seçimi</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seçiniz" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Elliot">Elliot</SelectItem>
                              <SelectItem value="Kylie">Kylie</SelectItem>
                              <SelectItem value="Rohan">Rohan</SelectItem>
                              <SelectItem value="Lily">Lily</SelectItem>
                              <SelectItem value="Savannah">Savannah</SelectItem>
                              <SelectItem value="Hana">Hana</SelectItem>
                              <SelectItem value="Neha">Neha</SelectItem>
                              <SelectItem value="Cole">Cole</SelectItem>
                              <SelectItem value="Harry">Harry</SelectItem>
                              <SelectItem value="Paige">Paige</SelectItem>
                              <SelectItem value="Spencer">Spencer</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {voiceProvider === '11labs' && (
                    <FormField
                      control={form.control}
                      name="voiceId"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>Özel Ses ID</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="11Labs'den aldığınız ses ID'sini girin"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            11Labs platformundan elde ettiğiniz ses kimliğini
                            buraya girin.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </TabsContent>

                <TabsContent value="transcriber" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="transcriberLanguage"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Dil</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="tr">Türkçe (tr)</SelectItem>
                            <SelectItem value="en">İngilizce (en)</SelectItem>
                            <SelectItem value="en-US">
                              İngilizce - ABD (en-US)
                            </SelectItem>
                            <SelectItem value="en-GB">
                              İngilizce - İngiltere (en-GB)
                            </SelectItem>
                            <SelectItem value="de">Almanca (de)</SelectItem>
                            <SelectItem value="fr">Fransızca (fr)</SelectItem>
                            <SelectItem value="es">İspanyolca (es)</SelectItem>
                            <SelectItem value="it">İtalyanca (it)</SelectItem>
                            <SelectItem value="pt">Portekizce (pt)</SelectItem>
                            <SelectItem value="ru">Rusça (ru)</SelectItem>
                            <SelectItem value="ja">Japonca (ja)</SelectItem>
                            <SelectItem value="ko">Korece (ko)</SelectItem>
                            <SelectItem value="zh">Çince (zh)</SelectItem>
                            <SelectItem value="ar">Arapça (ar)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="backgroundDenoisingEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Arka Plan Gürültü Engelleme
                          </FormLabel>
                          <FormDescription>
                            Kullanıcı konuşurken arka plan gürültüsünü filtrele.
                          </FormDescription>
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
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="backgroundSound"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Arkaplan Sesi
                          </FormLabel>
                          <FormDescription>
                            Görüşme sırasında arkaplan sesi oynatılsın.
                          </FormDescription>
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

                  <FormField
                    control={form.control}
                    name="endCallFunctionEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Çağrı Sonlandırma İşlevini Etkinleştir
                          </FormLabel>
                          <FormDescription>
                            Asistanın çağrıyı sonlandırma işlevini kullanmasına
                            izin verir.
                          </FormDescription>
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

                  <div className="space-y-4 rounded-lg border p-4">
                    <h3 className="text-lg font-medium">
                      Konuşma Durdurma Planı
                    </h3>

                    <FormField
                      control={form.control}
                      name="numWords"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>Kelime Sayısı</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              max={10}
                              step={1}
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Asistanın konuşmayı durdurmadan önce müşterinin
                            söylemesi gereken kelime sayısı (0-10).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="voiceSeconds"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>Ses Süresi (saniye)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              max={0.5}
                              step={0.1}
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Asistanın konuşmayı durdurmadan önce müşterinin
                            konuşması gereken süre (0-0.5 saniye).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="backoffSeconds"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>Geri Çekilme Süresi (saniye)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              max={10}
                              step={1}
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Kesildikten sonra asistanın tekrar konuşmaya
                            başlamadan önce bekleyeceği süre (0-10 saniye).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              </Tabs>
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
          <Button type="submit" form="ai-assistant-form" disabled={isLoading}>
            {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
