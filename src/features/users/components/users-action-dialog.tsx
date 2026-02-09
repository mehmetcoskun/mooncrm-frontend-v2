'use client';

import { useEffect, useState } from 'react';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getRoles } from '@/services/role-service';
import { createUser, updateUser } from '@/services/user-service';
import { getWhatsappSessions } from '@/services/whatsapp-session-service';
import { languages } from 'countries-list';
import { Settings, X, AlertTriangle, ShieldOff } from 'lucide-react';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/use-permissions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import MultiSelectDropdown from '@/components/multi-select-dropdown';
import { PasswordInput } from '@/components/password-input';
import { SelectDropdown } from '@/components/select-dropdown';
import { type Role } from '@/features/roles/data/schema';
import { type WorkSchedule, type User } from '../data/schema';
import { WorkScheduleSidebar } from './users-work-schedule-sidebar';

const formSchema = z.object({
  name: z.string().min(1, 'Kullanıcı adı gereklidir.'),
  email: z.email({
    error: (iss) =>
      iss.input === '' ? 'E-Posta adresi gereklidir.' : undefined,
  }),
  password: z
    .string()
    .min(6, { message: 'Şifre en az 6 karakter olmalıdır.' })
    .optional()
    .or(z.literal('')),
  is_active: z.boolean(),
  languages: z.array(z.string()),
  whatsapp_session_id: z.number().nullable().optional(),
  roles: z.array(z.number()),
  work_schedule: z
    .object({
      is_active: z.boolean(),
      days: z.array(
        z.object({
          day: z.number(),
          times: z.array(
            z.object({
              start: z.string(),
              end: z.string(),
            })
          ),
        })
      ),
    })
    .nullable(),
  isEdit: z.boolean(),
});
type UserForm = z.infer<typeof formSchema>;

type UserActionDialogProps = {
  currentRow?: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function UsersActionDialog({
  currentRow,
  open,
  onOpenChange,
  onSuccess,
}: UserActionDialogProps) {
  const { isSuperUser } = usePermissions();
  const [isLoading, setIsLoading] = useState(false);
  const [whatsappSessions, setWhatsappSessions] = useState<
    Record<string, unknown>[]
  >([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [workScheduleSidebarOpen, setWorkScheduleSidebarOpen] = useState(false);
  const [showDisable2FADialog, setShowDisable2FADialog] = useState(false);
  const [workSchedule, setWorkSchedule] = useState<WorkSchedule>({
    is_active: false,
    days: [
      { day: 0, times: [] },
      { day: 1, times: [] },
      { day: 2, times: [] },
      { day: 3, times: [] },
      { day: 4, times: [] },
      { day: 5, times: [] },
      { day: 6, times: [] },
    ],
  });

  const languageOptions = Object.entries(languages).map(([code, lang]) => ({
    value: code,
    label: lang.name,
  }));

  const isEdit = !!currentRow;
  const form = useForm<UserForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          name: currentRow.name,
          email: currentRow.email,
          password: '',
          whatsapp_session_id: currentRow.whatsapp_session_id,
          languages: currentRow.languages,
          is_active: currentRow.is_active,
          roles: currentRow.roles.map((role: Role) => role.id),
          work_schedule: currentRow.work_schedule,
          isEdit,
        }
      : {
          name: '',
          email: '',
          password: '',
          whatsapp_session_id: undefined,
          languages: [],
          is_active: true,
          roles: [],
          work_schedule: null,
          isEdit,
        },
  });

  useEffect(() => {
    const fetchWhatsappSessions = async () => {
      try {
        const data = await getWhatsappSessions();
        const nonAdminSessions = data.filter(
          (session: Record<string, unknown>) => !session.is_admin
        );
        setWhatsappSessions(nonAdminSessions);
      } catch (_error) {
        toast.error('Hata', {
          description: 'WhatsApp oturumları yüklenirken bir hata oluştu.',
        });
      }
    };

    const fetchRoles = async () => {
      try {
        const data = await getRoles();
        setRoles(data);
      } catch (_error) {
        toast.error('Hata', {
          description: 'Roller yüklenirken bir hata oluştu.',
        });
      }
    };

    fetchWhatsappSessions();
    fetchRoles();
  }, []);

  useEffect(() => {
    if (isEdit && currentRow?.work_schedule) {
      setWorkSchedule(currentRow.work_schedule);
    } else if (!isEdit) {
      setWorkSchedule({
        is_active: false,
        days: [
          { day: 0, times: [] },
          { day: 1, times: [] },
          { day: 2, times: [] },
          { day: 3, times: [] },
          { day: 4, times: [] },
          { day: 5, times: [] },
          { day: 6, times: [] },
        ],
      });
    }
  }, [isEdit, currentRow]);

  const onSubmit = async (values: UserForm) => {
    try {
      setIsLoading(true);
      const payload = { ...values };

      if (!payload.password) {
        delete payload.password;
      }

      const formattedRoles = Array.isArray(values.roles)
        ? values.roles
            .filter((id) => id !== null && id !== undefined)
            .map((id) => ({ id }))
        : [];

      const filteredSchedule = workSchedule.days.map((day) => ({
        ...day,
        times: day.times.filter(
          (time) =>
            time.start &&
            time.end &&
            time.start.trim() !== '' &&
            time.end.trim() !== ''
        ),
      }));

      const hasAnyTimes = filteredSchedule.some(
        (day) => day.times.length > 0
      );
      payload.work_schedule = {
        is_active: workSchedule.is_active,
        days: hasAnyTimes ? filteredSchedule : [],
      };

      if (isEdit && currentRow) {
        await updateUser(currentRow.id, {
          ...payload,
          roles: formattedRoles,
        });
        toast.success('Kullanıcı güncellendi', {
          description: `${values.name} kullanıcısı başarıyla güncellendi.`,
        });
      } else {
        await createUser({
          ...payload,
          roles: formattedRoles,
        });
        toast.success('Kullanıcı eklendi', {
          description: `${values.name} kullanıcısı başarıyla eklendi.`,
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

  const getLanguageName = (code: string): string => {
    return languages[code as keyof typeof languages]?.name || code;
  };

  const handleDisable2FA = async () => {
    if (!currentRow) return;

    try {
      setIsLoading(true);
      await updateUser(currentRow.id, {
        two_factor_secret: null,
        two_factor_recovery_codes: null,
        two_factor_enabled: false,
        two_factor_confirmed_at: null,
      });

      toast.success('2FA Devre Dışı Bırakıldı', {
        description:
          'İki faktörlü kimlik doğrulama başarıyla devre dışı bırakıldı.',
      });

      setShowDisable2FADialog(false);
      onOpenChange(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error('Hata', {
        description: `2FA devre dışı bırakılırken bir hata oluştu: ${error instanceof AxiosError ? error.response?.data.message : 'Bilinmeyen hata'}`,
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
            {isEdit ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Kullanıcıyı burada güncelleyin. '
              : 'Yeni kullanıcıyı burada oluşturun. '}
            İşlem tamamlandığında kaydet'e tıklayın.
          </DialogDescription>
        </DialogHeader>
        <div className="py-1">
          <Form {...form}>
            <form
              id="user-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 px-0.5"
            >
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Kullanıcı Durumu</FormLabel>
                      <div className="text-muted-foreground text-sm">
                        Kullanıcının sisteme erişim durumu
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
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Kullanıcı Adı</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        className="w-full"
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
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>E-posta</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ornek@mail.com"
                        className="w-full"
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
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>
                      {isEdit ? 'Şifre (Değiştirmek için doldurun)' : 'Şifre'}
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="e.g., S3cur3P@ssw0rd"
                        className="col-span-4"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="whatsapp_session_id"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>WhatsApp Oturumu</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <SelectDropdown
                          defaultValue={field.value?.toString() || ''}
                          onValueChange={(value) => {
                            field.onChange(
                              value ? parseInt(value, 10) : undefined
                            );
                          }}
                          placeholder="WhatsApp oturumu seçin"
                          items={whatsappSessions.map((session) => ({
                            value: String(session.id),
                            label: String(session.title),
                          }))}
                          isControlled={true}
                          className="w-full"
                        />
                      </FormControl>
                      {field.value && (
                        <button
                          type="button"
                          onClick={() => field.onChange(undefined)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-200"
                          aria-label="WhatsApp oturumunu kaldır"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="languages"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Diller</FormLabel>
                    <FormControl>
                      <MultiSelectDropdown
                        value={(field.value || []).map((lang) => ({
                          value: lang,
                          label: getLanguageName(lang),
                        }))}
                        onChange={(selectedOptions) => {
                          field.onChange(
                            selectedOptions.map((option) => option.value)
                          );
                        }}
                        placeholder="Dil seçiniz"
                        defaultOptions={languageOptions}
                        className="w-full"
                        hideClearAllButton
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="roles"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Roller</FormLabel>
                    <FormControl>
                      {isEdit &&
                      roles.length === 0 &&
                      field.value &&
                      field.value.length > 0 ? (
                        <Input
                          disabled
                          placeholder="Roller yükleniyor..."
                          className="w-full"
                        />
                      ) : (
                        <MultiSelectDropdown
                          key={`roles-dropdown-${roles.length}`}
                          value={field.value.map((roleId) => {
                            const role = roles.find((r) => r.id === roleId);
                            return {
                              value: roleId.toString(),
                              label: role ? role.title : `Rol #${roleId}`,
                            };
                          })}
                          onChange={(selectedOptions) => {
                            field.onChange(
                              selectedOptions.map((option) =>
                                parseInt(option.value, 10)
                              )
                            );
                          }}
                          placeholder="Rol seçiniz"
                          defaultOptions={roles.map((role) => ({
                            value: role.id.toString(),
                            label: role.title,
                          }))}
                          className="w-full"
                          hideClearAllButton
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isEdit && isSuperUser() && currentRow?.two_factor_enabled && (
                <div className="mt-4 space-y-4 border-t pt-4">
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-3">
                        <div>
                          <p className="font-medium">
                            İki Faktörlü Kimlik Doğrulama
                          </p>
                          <p className="text-sm">
                            Bu kullanıcı için 2FA aktif durumda.
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => setShowDisable2FADialog(true)}
                          disabled={isLoading}
                        >
                          <ShieldOff className="mr-2 h-4 w-4" />
                          2FA'yı Devre Dışı Bırak
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              <div className="mt-4 space-y-4 border-t pt-4">
                <div className="space-y-2">
                  <span className="text-sm font-medium">Mesai Saatleri</span>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={workSchedule.is_active}
                        onCheckedChange={(checked) => {
                          const newSchedule = {
                            ...workSchedule,
                            is_active: checked,
                          };
                          setWorkSchedule(newSchedule);
                          form.setValue('work_schedule', newSchedule);
                        }}
                      />
                      <span className="text-sm">
                        {workSchedule.is_active ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setWorkScheduleSidebarOpen(true)}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Düzenle
                    </Button>
                  </div>
                </div>

                {workSchedule.is_active && (
                  <div className="bg-muted rounded-md p-3">
                    <div className="grid grid-cols-1 gap-2">
                      {workSchedule.days
                        .filter((day) => day.times.length > 0)
                        .map((day) => (
                          <div
                            key={day.day}
                            className="flex items-center gap-2"
                          >
                            <span className="min-w-[80px] text-sm font-medium">
                              {
                                [
                                  'Pazartesi',
                                  'Salı',
                                  'Çarşamba',
                                  'Perşembe',
                                  'Cuma',
                                  'Cumartesi',
                                  'Pazar',
                                ][day.day]
                              }
                              :
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {day.times.map((time, index) => (
                                <span
                                  key={index}
                                  className="bg-primary/10 rounded px-2 py-1 text-xs"
                                >
                                  {time.start} - {time.end}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      {workSchedule.days.filter((day) => day.times.length > 0)
                        .length === 0 && (
                        <span className="text-muted-foreground text-sm">
                          Mesai saati tanımlanmamış
                        </span>
                      )}
                    </div>
                  </div>
                )}
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
          <Button type="submit" form="user-form" disabled={isLoading}>
            {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogFooter>
      </DialogContent>

      <WorkScheduleSidebar
        open={workScheduleSidebarOpen}
        onOpenChange={setWorkScheduleSidebarOpen}
        workSchedule={workSchedule}
        onWorkScheduleChange={(newSchedule) => {
          setWorkSchedule(newSchedule);
          form.setValue('work_schedule', newSchedule);
        }}
      />

      <AlertDialog
        open={showDisable2FADialog}
        onOpenChange={setShowDisable2FADialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>2FA'yı Devre Dışı Bırak</AlertDialogTitle>
            <AlertDialogDescription>
              Bu kullanıcının iki faktörlü kimlik doğrulamasını devre dışı
              bırakmak istediğinizden emin misiniz? Bu işlem kullanıcının tüm
              2FA ayarlarını sıfırlayacaktır ve geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisable2FA}
              disabled={isLoading}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {isLoading ? 'İşleniyor...' : 'Devre Dışı Bırak'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
