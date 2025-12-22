'use client';

import { useState, useEffect, useMemo } from 'react';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { getCategories } from '@/services/category-service';
import {
  getCustomer,
  updateCustomer,
  getCustomerLogs,
  getCustomerFiles,
  createCustomerFile,
  updateCustomerFile,
  destroyCustomerFile,
} from '@/services/customer-service';
import { getDoctors } from '@/services/doctor-service';
import { getHotels } from '@/services/hotel-service';
import { getServices } from '@/services/service-service';
import { getStatuses } from '@/services/status-service';
import { getTransfers } from '@/services/transfer-service';
import { getUsers } from '@/services/user-service';
import { countries } from 'countries-list';
import {
  User,
  Activity,
  Bell,
  Phone,
  ShoppingCart,
  CreditCard,
  FileText,
  History,
  Upload,
  Trash2,
  Edit2,
  Download,
  X,
  Copy,
  Sparkles,
  Bot,
} from 'lucide-react';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/hooks/use-permissions';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { LeadSwitch } from '@/components/lead-switch';
import { MultiSelect } from '@/components/multi-select';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { SearchableSelect } from '@/components/searchable-select';
import { ThemeSwitch } from '@/components/theme-switch';
import { ForbiddenError } from '@/features/errors/forbidden';
import { GeneralError } from '@/features/errors/general-error';
import { NotFoundError } from '@/features/errors/not-found-error';
import { type Customer, type TravelInfo } from '../data/schema';
import { CustomersTeethDialog } from './customers-teeth-dialog';

const phoneCallSchema = z.object({
  date: z.string().nullable(),
  time: z.string().nullable(),
  notes: z.string().nullable(),
  is_ai_call: z.boolean().optional(),
  recording_url: z.string().optional().nullable(),
});

const salesInfoSchema = z.object({
  sales_date: z.string().nullable(),
  trustpilot_review: z.boolean(),
  google_maps_review: z.boolean(),
  satisfaction_survey: z.boolean(),
  warranty_sent: z.boolean(),
  rpt: z.boolean(),
  health_notes: z.string().nullable(),
});

const toothSchema = z.object({
  tooth_number: z.number(),
  treatment: z.string().nullable(),
});

const travelInfoSchema = z.object({
  appointment_date: z.string().nullable(),
  appointment_time: z.string().nullable(),
  doctor_id: z.number().nullable(),
  teeth: z.array(toothSchema).nullable(),
  is_custom_hotel: z.boolean(),
  hotel_id: z.number().nullable(),
  hotel_name: z.string().nullable(),
  is_custom_transfer: z.boolean(),
  transfer_id: z.number().nullable(),
  transfer_name: z.string().nullable(),
  room_type: z.string().nullable(),
  person_count: z.string().nullable(),
  notes: z.string().nullable(),
  arrival_date: z.string().nullable(),
  arrival_time: z.string().nullable(),
  arrival_flight_code: z.string().nullable(),
  departure_date: z.string().nullable(),
  departure_time: z.string().nullable(),
  departure_flight_code: z.string().nullable(),
});

const reminderSchema = z.object({
  status: z.boolean(),
  date: z.string().nullable(),
  notes: z.string().nullable(),
});

const formSchema = z
  .object({
    user_id: z.number().min(1, { message: 'Danışman seçimi zorunludur.' }),
    category_id: z.number().min(1, { message: 'Kategori seçimi zorunludur.' }),
    status_id: z.number().min(1, { message: 'Durum seçimi zorunludur.' }),
    service_ids: z.array(z.number()),
    name: z.string().min(1, { message: 'Ad Soyad alanı zorunludur.' }),
    email: z.string().optional(),
    phone: z.string().min(1, { message: 'Telefon alanı zorunludur.' }),
    country: z.string().min(1, { message: 'Ülke alanı zorunludur.' }),
    notes: z.string().optional(),
    payment_notes: z.string().optional(),
    created_at: z.string().optional(),
    reminder: reminderSchema,
    phone_calls: z.array(phoneCallSchema),
    sales_info: salesInfoSchema,
    travel_info: z.array(travelInfoSchema),
  })
  .refine(
    (data) => {
      if (data.status_id === 8) {
        return (
          data.sales_info.sales_date && data.sales_info.sales_date.trim() !== ''
        );
      }
      return true;
    },
    {
      message: 'Satış Tarihi alanı zorunludur.',
      path: ['sales_info', 'sales_date'],
    }
  );

type CustomerFormValues = z.infer<typeof formSchema>;

const getSidebarNavItems = (
  canAccessFiles: boolean,
  canAccessLogs: boolean,
  customerStatusId?: number
) =>
  [
    {
      title: 'Kişisel Bilgiler',
      id: 'personal',
      icon: <User size={18} />,
      show: true,
    },
    {
      title: 'Durum Bilgileri',
      id: 'status',
      icon: <Activity size={18} />,
      show: true,
    },
    {
      title: 'Hatırlatıcı',
      id: 'reminders',
      icon: <Bell size={18} />,
      show: true,
    },
    {
      title: 'Telefon Görüşmeleri',
      id: 'calls',
      icon: <Phone size={18} />,
      show: true,
    },
    {
      title: 'Satış',
      id: 'sales',
      icon: <ShoppingCart size={18} />,
      show: customerStatusId === 8,
    },
    {
      title: 'Ödeme',
      id: 'payments',
      icon: <CreditCard size={18} />,
      show: true,
    },
    {
      title: 'Dosyalar',
      id: 'files',
      icon: <FileText size={18} />,
      show: canAccessFiles,
    },
    {
      title: 'Değişiklik Geçmişi',
      id: 'history',
      icon: <History size={18} />,
      show: canAccessLogs,
    },
  ].filter((item) => item.show);

export function CustomersDetail() {
  const { customerId } = useParams({
    from: '/_authenticated/customers/$customerId',
  });

  const { hasPermission } = usePermissions();

  const canAccessLogs = hasPermission('customer_LogAccess');
  const canAccessFiles = hasPermission('customer_FileAccess');

  const [activeSection, setActiveSection] = useState('personal');

  const [facebookLeadInfo, setFacebookLeadInfo] = useState({
    ad_name: '',
    adset_name: '',
    campaign_name: '',
    lead_form_id: '',
  });

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user_id: 0,
      category_id: 0,
      status_id: 0,
      service_ids: [],
      name: '',
      email: '',
      phone: '',
      country: '',
      notes: '',
      payment_notes: '',
      created_at: '',
      reminder: {
        status: false,
        date: null,
        notes: null,
      },
      phone_calls: [],
      sales_info: {
        sales_date: '',
        trustpilot_review: false,
        google_maps_review: false,
        satisfaction_survey: false,
        warranty_sent: false,
        rpt: false,
        health_notes: '',
      },
      travel_info: [],
    },
  });

  const {
    watch,
    setValue,
    getValues,
    formState: { dirtyFields },
  } = form;

  const phoneCalls = watch('phone_calls');
  const salesInfo = watch('sales_info');
  const travelInfo = watch('travel_info');
  const reminderEnabled = watch('reminder.status');

  const [editingFileId, setEditingFileId] = useState<number | null>(null);
  const [editingFileName, setEditingFileName] = useState('');
  const [teethDialogOpen, setTeethDialogOpen] = useState(false);
  const [currentTravelIndex, setCurrentTravelIndex] = useState<number | null>(
    null
  );

  const {
    data: customer,
    isLoading,
    isError,
    error,
  } = useQuery<Customer>({
    queryKey: ['customer', customerId],
    queryFn: () => getCustomer(Number(customerId)),
    retry: false,
  });

  const sidebarNavItems = useMemo(
    () =>
      getSidebarNavItems(canAccessFiles, canAccessLogs, customer?.status_id),
    [canAccessFiles, canAccessLogs, customer?.status_id]
  );

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: getServices,
  });

  const { data: statuses = [] } = useQuery({
    queryKey: ['statuses'],
    queryFn: getStatuses,
  });

  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors'],
    queryFn: getDoctors,
  });

  const { data: hotels = [] } = useQuery({
    queryKey: ['hotels'],
    queryFn: getHotels,
  });

  const { data: transfers = [] } = useQuery({
    queryKey: ['transfers'],
    queryFn: getTransfers,
  });

  const { data: customerLogs = [], isLoading: isLogsLoading } = useQuery({
    queryKey: ['customerLogs', customerId],
    queryFn: () => getCustomerLogs(Number(customerId)),
    enabled: activeSection === 'history',
  });

  const {
    data: customerFiles = [],
    isLoading: isFilesLoading,
    refetch: refetchFiles,
  } = useQuery({
    queryKey: ['customerFiles', customerId],
    queryFn: () => getCustomerFiles(Number(customerId)),
    enabled: activeSection === 'files',
  });

  const uploadFilesMutation = useMutation({
    mutationFn: (formData: FormData) =>
      createCustomerFile(Number(customerId), formData),
    onSuccess: () => {
      toast.success('Başarılı', {
        description: 'Dosyalar yüklendi.',
      });
      refetchFiles();
    },
    onError: () => {
      toast.error('Hata', {
        description: 'Dosya yükleme işlemi başarısız.',
      });
    },
  });

  const updateFileMutation = useMutation({
    mutationFn: ({ fileId, title }: { fileId: number; title: string }) =>
      updateCustomerFile(Number(customerId), fileId, { title }),
    onSuccess: () => {
      toast.success('Başarılı', {
        description: 'Dosya adı güncellendi.',
      });
      refetchFiles();
      setEditingFileId(null);
      setEditingFileName('');
    },
    onError: () => {
      toast.error('Hata', {
        description: 'Dosya güncelleme işlemi başarısız.',
      });
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: (fileId: number) =>
      destroyCustomerFile(Number(customerId), fileId),
    onSuccess: () => {
      toast.success('Başarılı', {
        description: 'Dosya silindi.',
      });
      refetchFiles();
    },
    onError: () => {
      toast.error('Hata', {
        description: 'Dosya silme işlemi başarısız.',
      });
    },
  });

  useEffect(() => {
    if (customer) {
      form.reset({
        user_id: customer.user_id || 0,
        category_id: customer.category_id || 0,
        status_id: customer.status_id || 0,
        service_ids: customer.services?.map((s) => s.id) || [],
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        country: customer.country || '',
        notes: customer.notes || '',
        payment_notes: customer.payment_notes || '',
        created_at: customer.created_at?.toString() || '',
        reminder: {
          status: customer.reminder?.status || false,
          date: customer.reminder?.date || null,
          notes: customer.reminder?.notes || null,
        },
        phone_calls: customer.phone_calls || [],
        sales_info: {
          sales_date: customer.sales_info?.sales_date || '',
          trustpilot_review: customer.sales_info?.trustpilot_review || false,
          google_maps_review: customer.sales_info?.google_maps_review || false,
          satisfaction_survey:
            customer.sales_info?.satisfaction_survey || false,
          warranty_sent: customer.sales_info?.warranty_sent || false,
          rpt: customer.sales_info?.rpt || false,
          health_notes: customer.sales_info?.health_notes || '',
        },
        travel_info:
          customer.travel_info && Array.isArray(customer.travel_info)
            ? customer.travel_info.map((travel) => ({
                ...travel,
                teeth: travel.teeth || [],
                person_count: String(travel.person_count ?? ''),
              }))
            : [],
      });

      setFacebookLeadInfo({
        ad_name: customer.ad_name || '',
        adset_name: customer.adset_name || '',
        campaign_name: customer.campaign_name || '',
        lead_form_id: customer.lead_form_id || '',
      });

      if (customer.duplicate_count > 0 && !customer.duplicate_checked) {
        updateCustomer(Number(customerId), { duplicate_checked: true });
      }
    }
  }, [customer, customerId, form]);

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      updateCustomer(Number(customerId), data),
    onSuccess: () => {
      toast.success('Başarılı', {
        description: 'Müşteri bilgileri güncellendi.',
      });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data.message
          : 'Bir hata oluştu.';
      toast.error('Hata', {
        description: errorMessage,
      });
    },
  });

  const handleSave = () => {
    const values = getValues();

    // travel_info içindeki alanları normalize et
    const normalizedValues = {
      ...values,
      travel_info: values.travel_info.map((travel) => ({
        ...travel,
        teeth: travel.teeth || [],
        person_count: String(travel.person_count ?? ''),
      })),
    };

    const validationResult = formSchema.safeParse(normalizedValues);

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      toast.error('Hata', {
        description: firstError.message,
      });
      return;
    }

    const dataToSave: Record<string, unknown> = {};

    const isDirty = (path: string): boolean => {
      const parts = path.split('.');
      let current: unknown = dirtyFields;
      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = (current as Record<string, unknown>)[part];
        } else {
          return false;
        }
      }
      return Boolean(current);
    };

    if (isDirty('user_id')) dataToSave.user_id = values.user_id;
    if (isDirty('category_id')) dataToSave.category_id = values.category_id;
    if (isDirty('status_id')) dataToSave.status_id = values.status_id;
    if (isDirty('service_ids')) dataToSave.service_ids = values.service_ids;
    if (isDirty('name')) dataToSave.name = values.name;
    if (isDirty('email')) dataToSave.email = values.email;
    if (isDirty('phone')) dataToSave.phone = values.phone;
    if (isDirty('country')) dataToSave.country = values.country;
    if (isDirty('notes')) dataToSave.notes = values.notes;
    if (isDirty('payment_notes'))
      dataToSave.payment_notes = values.payment_notes;
    if (isDirty('created_at')) dataToSave.created_at = values.created_at;

    if (dirtyFields.reminder) {
      dataToSave.reminder = values.reminder;
    }
    if (dirtyFields.phone_calls) {
      dataToSave.phone_calls = values.phone_calls;
    }
    if (dirtyFields.sales_info) {
      dataToSave.sales_info = values.sales_info;
    }
    if (dirtyFields.travel_info) {
      dataToSave.travel_info = values.travel_info;
    }

    if (Object.keys(dataToSave).length === 0) {
      toast.info('Bilgi', {
        description: 'Değişiklik yapılmadı.',
      });
      return;
    }

    updateMutation.mutate(dataToSave);
  };

  const addPhoneCall = () => {
    const currentCalls = getValues('phone_calls');
    setValue(
      'phone_calls',
      [
        ...currentCalls,
        {
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().slice(0, 5),
          notes: '',
        },
      ],
      { shouldDirty: true }
    );
  };

  const updatePhoneCall = (
    index: number,
    field: 'date' | 'time' | 'notes',
    value: string
  ) => {
    const currentCalls = getValues('phone_calls');
    const updated = [...currentCalls];
    updated[index] = { ...updated[index], [field]: value };
    setValue('phone_calls', updated, { shouldDirty: true });
  };

  const deletePhoneCall = (index: number) => {
    const currentCalls = getValues('phone_calls');
    setValue(
      'phone_calls',
      currentCalls.filter((_, i) => i !== index),
      { shouldDirty: true }
    );
  };

  const addTravel = () => {
    const currentTravel = getValues('travel_info');
    setValue(
      'travel_info',
      [
        ...currentTravel,
        {
          appointment_date: '',
          appointment_time: '',
          doctor_id: null,
          teeth: [],
          is_custom_hotel: false,
          hotel_id: null,
          hotel_name: '',
          is_custom_transfer: false,
          transfer_id: null,
          transfer_name: '',
          room_type: '',
          person_count: '',
          notes: '',
          arrival_date: '',
          arrival_time: '',
          arrival_flight_code: '',
          departure_date: '',
          departure_time: '',
          departure_flight_code: '',
        },
      ],
      { shouldDirty: true }
    );
  };

  const updateTravel = (
    index: number,
    field: keyof TravelInfo,
    value: unknown
  ) => {
    const currentTravel = getValues('travel_info');
    const updated = [...currentTravel];
    (updated[index] as unknown as Record<string, unknown>)[field] = value;
    setValue('travel_info', updated, { shouldDirty: true });
  };

  const deleteTravel = (index: number) => {
    const currentTravel = getValues('travel_info');
    setValue(
      'travel_info',
      currentTravel.filter((_, i) => i !== index),
      { shouldDirty: true }
    );
  };

  const getFieldNameInTurkish = (fieldName: string) => {
    const fieldNames: Record<string, string> = {
      customer: 'Müşteri',
      organization_id: 'Firma',
      user_id: 'Danışman',
      category_id: 'Kategori',
      status_id: 'Durum',
      name: 'Ad Soyad',
      email: 'E-Posta',
      phone: 'Telefon',
      country: 'Ülke',
      notes: 'Notlar',
      phone_calls: 'Telefon Görüşmeleri',
      reminder: 'Hatırlatıcı',
      sales_info: 'Satış Bilgileri',
      travel_info: 'Seyahat Bilgileri',
      payment_notes: 'Ödeme Notları',
      created_at: 'Kayıt Tarihi',
    };
    return fieldNames[fieldName] || fieldName;
  };

  const formatJsonValue = (value: unknown): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'boolean') return value.toString();
    if (typeof value === 'string') return value || '-';
    if (typeof value === 'number') return value.toString();
    if (Array.isArray(value)) {
      return value.length > 0 ? `${value.length} öğe` : 'Boş';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  };

  const isJsonObject = (value: string): boolean => {
    if (!value || value === 'null') return false;
    try {
      const parsed = JSON.parse(value);
      return (
        typeof parsed === 'object' && !Array.isArray(parsed) && parsed !== null
      );
    } catch {
      return false;
    }
  };

  const formatLogValue = (value: string, fieldName: string) => {
    if (!value || value === 'null') return '-';

    try {
      const parsed = JSON.parse(value);

      if (fieldName === 'user_id' && parsed.name) {
        return parsed.name;
      }
      if (fieldName === 'category_id' && parsed.title) {
        return parsed.title;
      }
      if (fieldName === 'status_id' && parsed.title) {
        return parsed.title;
      }
      if (fieldName === 'reminder') {
        return `${parsed.status ? 'Aktif' : 'Pasif'} - ${parsed.date || ''}`;
      }
      if (fieldName === 'phone_calls') {
        return `${parsed.length || 0} görüşme`;
      }
      if (
        typeof parsed === 'object' &&
        !Array.isArray(parsed) &&
        parsed !== null
      ) {
        return JSON.stringify(parsed);
      }

      return value;
    } catch {
      return value;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('files[]', file);
    });

    uploadFilesMutation.mutate(formData);
    e.target.value = '';
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('files[]', file);
    });

    uploadFilesMutation.mutate(formData);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const startEditingFile = (fileId: number, currentTitle: string) => {
    const lastDotIndex = currentTitle.lastIndexOf('.');
    const nameWithoutExtension =
      lastDotIndex > 0 ? currentTitle.substring(0, lastDotIndex) : currentTitle;

    setEditingFileId(fileId);
    setEditingFileName(nameWithoutExtension);
  };

  const saveFileName = (fileId: number, originalTitle: string) => {
    if (editingFileName.trim()) {
      const lastDotIndex = originalTitle.lastIndexOf('.');
      const extension =
        lastDotIndex > 0 ? originalTitle.substring(lastDotIndex) : '';
      const newTitle = editingFileName.trim() + extension;

      updateFileMutation.mutate({ fileId, title: newTitle });
    }
  };

  const cancelEditingFile = () => {
    setEditingFileId(null);
    setEditingFileName('');
  };

  const countryOptions = Object.entries(countries).map(([code, country]) => ({
    label: country.name,
    value: code,
  }));

  const userOptions = users
    .filter((user: { id: number; name: string; roles: { id: number }[] }) =>
      user.roles.some((role) => role.id === 3)
    )
    .map((user: { id: number; name: string }) => ({
      label: user.name,
      value: String(user.id),
    }));

  const categoryOptions = categories.map(
    (cat: { id: number; title: string }) => ({
      label: cat.title,
      value: String(cat.id),
    })
  );

  const serviceOptions = services.map(
    (service: { id: number; title: string }) => ({
      label: service.title,
      value: String(service.id),
    })
  );

  const statusOptions = statuses.map(
    (status: { id: number; title: string }) => ({
      label: status.title,
      value: String(status.id),
    })
  );

  if (isLoading) {
    return (
      <>
        <Header fixed>
          <div className="ms-auto flex items-center space-x-4">
            <ThemeSwitch />
            <ProfileDropdown />
          </div>
        </Header>
        <Main fluid>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Yükleniyor...</p>
          </div>
        </Main>
      </>
    );
  }

  if (isError) {
    const axiosError = error as { response?: { status?: number } };
    const statusCode = axiosError?.response?.status;

    if (statusCode === 403) {
      return <ForbiddenError />;
    }

    if (statusCode === 404) {
      return <NotFoundError />;
    }

    return <GeneralError />;
  }

  return (
    <>
      <Header fixed>
        <div className="ms-auto flex items-center space-x-4">
          <LeadSwitch />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fixed fluid>
        <div className="mb-4 flex items-center justify-between gap-4 lg:mb-6">
          <div className="min-w-0 flex-1 space-y-1">
            <h1 className="truncate text-2xl font-bold tracking-tight md:text-3xl">
              {customer?.name}
            </h1>
            <p className="text-muted-foreground">#{customerId}</p>
            {customer && customer.duplicate_count > 0 && (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 px-2.5 py-1 text-xs font-medium text-white">
                <Copy className="h-3 w-3" />
                <span>{customer.duplicate_count} Tekrarlı</span>
              </div>
            )}
          </div>

          <PermissionGuard permission="customer_Edit">
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="shrink-0"
            >
              {updateMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </PermissionGuard>
        </div>

        <Separator className="my-4 lg:my-6" />

        <div className="flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12">
          <aside className="top-0 lg:sticky lg:w-1/5">
            <div className="p-1 md:hidden">
              <Select value={activeSection} onValueChange={setActiveSection}>
                <SelectTrigger className="h-12 sm:w-48">
                  <SelectValue placeholder="Bölüm Seçin" />
                </SelectTrigger>
                <SelectContent>
                  {sidebarNavItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      <div className="flex gap-x-4 px-2 py-1">
                        <span className="scale-125">{item.icon}</span>
                        <span className="text-md">{item.title}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ScrollArea
              orientation="horizontal"
              type="always"
              className="bg-background hidden w-full min-w-40 px-1 py-2 md:block"
            >
              <nav className="flex space-x-2 py-1 lg:flex-col lg:space-y-1 lg:space-x-0">
                {sidebarNavItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={cn(
                      buttonVariants({ variant: 'ghost' }),
                      activeSection === item.id
                        ? 'bg-muted hover:bg-accent'
                        : 'hover:bg-accent hover:underline',
                      'w-full justify-start'
                    )}
                  >
                    <span className="me-2">{item.icon}</span>
                    {item.title}
                  </button>
                ))}
              </nav>
            </ScrollArea>
          </aside>

          <ScrollArea className="flex w-full flex-col overflow-y-hidden p-1">
            <div className="rounded-lg border p-6">
              {activeSection === 'personal' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Temel Bilgiler</h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Ad Soyad <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="name"
                        placeholder="Ad Soyad"
                        value={watch('name')}
                        onChange={(e) =>
                          setValue('name', e.target.value, {
                            shouldDirty: true,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        Telefon <span className="text-destructive">*</span>
                      </Label>
                      {watch('phone') !== '' && (
                        <PhoneInput
                          defaultCountry="tr"
                          value={watch('phone')}
                          onChange={(phone) =>
                            setValue('phone', phone, { shouldDirty: true })
                          }
                          className="w-full"
                          inputClassName="w-full"
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">E-Posta</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="ornek@email.com"
                        value={watch('email') || ''}
                        onChange={(e) =>
                          setValue('email', e.target.value, {
                            shouldDirty: true,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">
                        Ülke <span className="text-destructive">*</span>
                      </Label>
                      <SearchableSelect
                        value={watch('country')}
                        onValueChange={(value) =>
                          setValue('country', value, { shouldDirty: true })
                        }
                        placeholder="Ülke seçin"
                        searchPlaceholder="Ülke ara..."
                        items={countryOptions}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notlar</Label>
                    <Textarea
                      id="notes"
                      placeholder="Müşteri hakkında notlar..."
                      rows={4}
                      value={watch('notes') || ''}
                      onChange={(e) =>
                        setValue('notes', e.target.value, { shouldDirty: true })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="created_at">Kayıt Tarihi</Label>
                    <Input
                      id="created_at"
                      type="datetime-local"
                      value={
                        watch('created_at')
                          ? new Date(
                              new Date(watch('created_at')!).getTime() -
                                new Date(
                                  watch('created_at')!
                                ).getTimezoneOffset() *
                                  60000
                            )
                              .toISOString()
                              .slice(0, 16)
                          : ''
                      }
                      onChange={(e) =>
                        setValue('created_at', e.target.value, {
                          shouldDirty: true,
                        })
                      }
                    />
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      Facebook Lead Bilgileri
                    </h3>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="ad_name">Reklam Adı</Label>
                        <Input
                          id="ad_name"
                          placeholder="Reklam Adı"
                          value={facebookLeadInfo.ad_name}
                          disabled
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="adset_name">Reklam Grubu Adı</Label>
                        <Input
                          id="adset_name"
                          placeholder="Reklam Grubu Adı"
                          value={facebookLeadInfo.adset_name}
                          disabled
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="campaign_name">Kampanya Adı</Label>
                        <Input
                          id="campaign_name"
                          placeholder="Kampanya Adı"
                          value={facebookLeadInfo.campaign_name}
                          disabled
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lead_form_id">Lead Form ID</Label>
                        <Input
                          id="lead_form_id"
                          placeholder="Lead Form ID"
                          value={facebookLeadInfo.lead_form_id}
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'status' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Durum Bilgileri</h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="user_id">
                        Danışman <span className="text-destructive">*</span>
                      </Label>
                      <SearchableSelect
                        value={watch('user_id') ? String(watch('user_id')) : ''}
                        onValueChange={(value) =>
                          setValue('user_id', Number(value), {
                            shouldDirty: true,
                          })
                        }
                        placeholder="Danışman seçin"
                        searchPlaceholder="Danışman ara..."
                        items={userOptions}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category_id">
                        Kategori <span className="text-destructive">*</span>
                      </Label>
                      <SearchableSelect
                        value={
                          watch('category_id')
                            ? String(watch('category_id'))
                            : ''
                        }
                        onValueChange={(value) =>
                          setValue('category_id', Number(value), {
                            shouldDirty: true,
                          })
                        }
                        placeholder="Kategori seçin"
                        searchPlaceholder="Kategori ara..."
                        items={categoryOptions}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status_id">
                        Durum <span className="text-destructive">*</span>
                      </Label>
                      <SearchableSelect
                        value={
                          watch('status_id') ? String(watch('status_id')) : ''
                        }
                        onValueChange={(value) =>
                          setValue('status_id', Number(value), {
                            shouldDirty: true,
                          })
                        }
                        placeholder="Durum seçin"
                        searchPlaceholder="Durum ara..."
                        items={statusOptions}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="service_ids">Hizmetler</Label>
                      <MultiSelect
                        options={serviceOptions}
                        defaultValue={watch('service_ids').map(String)}
                        onValueChange={(values) =>
                          setValue('service_ids', values.map(Number), {
                            shouldDirty: true,
                          })
                        }
                        placeholder="Hizmet seçin"
                        maxCount={2}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'reminders' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">
                    Hatırlatıcı Ayarları
                  </h3>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="reminder_enabled" className="text-base">
                        Hatırlatma Durumu
                      </Label>
                      <p className="text-muted-foreground text-sm">
                        Bu müşteri için hatırlatma aktif mi?
                      </p>
                    </div>
                    <Switch
                      id="reminder_enabled"
                      checked={reminderEnabled}
                      onCheckedChange={(checked) =>
                        setValue('reminder.status', checked, {
                          shouldDirty: true,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reminder_date">
                      Hatırlatma Tarihi ve Saati
                    </Label>
                    <Input
                      id="reminder_date"
                      type="datetime-local"
                      value={
                        watch('reminder.date')
                          ? new Date(
                              new Date(watch('reminder.date')!).getTime() -
                                new Date(
                                  watch('reminder.date')!
                                ).getTimezoneOffset() *
                                  60000
                            )
                              .toISOString()
                              .slice(0, 16)
                          : ''
                      }
                      onChange={(e) =>
                        setValue('reminder.date', e.target.value, {
                          shouldDirty: true,
                        })
                      }
                      disabled={!reminderEnabled}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reminder_notes">Hatırlatma Notları</Label>
                    <Textarea
                      id="reminder_notes"
                      placeholder="Hatırlatma ile ilgili notlar..."
                      rows={6}
                      value={watch('reminder.notes') || ''}
                      onChange={(e) =>
                        setValue('reminder.notes', e.target.value, {
                          shouldDirty: true,
                        })
                      }
                      disabled={!reminderEnabled}
                    />
                  </div>
                </div>
              )}

              {activeSection === 'calls' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      Telefon Görüşmeleri
                    </h3>
                    <Button onClick={addPhoneCall} size="sm">
                      Yeni Görüşme Ekle
                    </Button>
                  </div>

                  {phoneCalls.length === 0 ? (
                    <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-dashed">
                      <div className="text-center">
                        <Phone className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
                        <p className="text-muted-foreground">
                          Henüz telefon görüşmesi kaydı yok
                        </p>
                        <Button
                          onClick={addPhoneCall}
                          variant="outline"
                          size="sm"
                          className="mt-4"
                        >
                          İlk Görüşmeyi Ekle
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {phoneCalls.map((call, index) => (
                        <div
                          key={index}
                          className={cn(
                            'space-y-4 rounded-lg border p-4',
                            call.is_ai_call &&
                              'border-violet-200 bg-violet-50/50 dark:border-violet-800 dark:bg-violet-950/20'
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {call.is_ai_call ? (
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/50">
                                  <Bot className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                                </div>
                              ) : (
                                <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
                                  <Phone className="text-muted-foreground h-4 w-4" />
                                </div>
                              )}
                              <div>
                                <h4 className="font-medium">
                                  {index + 1}. Görüşme
                                </h4>
                                {call.is_ai_call && (
                                  <div className="flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400">
                                    <Sparkles className="h-3 w-3" />
                                    <span>Yapay Zeka Araması</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            {!call.is_ai_call && (
                              <Button
                                onClick={() => deletePhoneCall(index)}
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                              >
                                Sil
                              </Button>
                            )}
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor={`call-date-${index}`}>
                                Görüşme Tarihi
                              </Label>
                              <Input
                                id={`call-date-${index}`}
                                type="date"
                                value={call.date || ''}
                                onChange={(e) =>
                                  updatePhoneCall(index, 'date', e.target.value)
                                }
                                disabled={call.is_ai_call || false}
                                className={cn(
                                  call.is_ai_call &&
                                    'border-violet-200 bg-violet-100/50 dark:border-violet-800 dark:bg-violet-900/30'
                                )}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`call-time-${index}`}>
                                Görüşme Saati
                              </Label>
                              <Input
                                id={`call-time-${index}`}
                                type="time"
                                value={call.time || ''}
                                onChange={(e) =>
                                  updatePhoneCall(index, 'time', e.target.value)
                                }
                                disabled={call.is_ai_call || false}
                                className={cn(
                                  call.is_ai_call &&
                                    'border-violet-200 bg-violet-100/50 dark:border-violet-800 dark:bg-violet-900/30'
                                )}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`call-notes-${index}`}>
                              {call.is_ai_call
                                ? 'AI Görüşme Özeti'
                                : 'Görüşme Notları'}
                            </Label>
                            <Textarea
                              id={`call-notes-${index}`}
                              placeholder={
                                call.is_ai_call
                                  ? ''
                                  : 'Görüşme notlarını buraya yazın...'
                              }
                              rows={3}
                              value={call.notes || ''}
                              onChange={(e) =>
                                updatePhoneCall(index, 'notes', e.target.value)
                              }
                              disabled={call.is_ai_call || false}
                              className={cn(
                                call.is_ai_call &&
                                  'border-violet-200 bg-violet-100/50 dark:border-violet-800 dark:bg-violet-900/30'
                              )}
                            />
                          </div>

                          {call.is_ai_call && (
                            <div className="space-y-3">
                              {call.recording_url && (
                                <div className="space-y-2">
                                  <Label>Görüşme Kaydı</Label>
                                  <audio
                                    controls
                                    className="h-10 w-full"
                                    preload="metadata"
                                  >
                                    <source
                                      src={call.recording_url}
                                      type="audio/wav"
                                    />
                                    <source
                                      src={call.recording_url}
                                      type="audio/mpeg"
                                    />
                                    Tarayıcınız ses dosyasını desteklemiyor.
                                  </audio>
                                </div>
                              )}
                              <div className="flex items-start gap-2 rounded-md bg-violet-100/70 p-3 text-sm text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                                <Bot className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                <span>
                                  Bu görüşme yapay zeka asistanı tarafından
                                  otomatik olarak gerçekleştirilmiş ve kayıt
                                  edilmiştir.
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'sales' && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Satış Bilgileri</h3>

                    <div className="space-y-2">
                      <Label htmlFor="sales_date">
                        Satış Tarihi <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="sales_date"
                        type="date"
                        value={salesInfo.sales_date || ''}
                        onChange={(e) =>
                          setValue('sales_info.sales_date', e.target.value, {
                            shouldDirty: true,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="health_notes">Sağlık Notları</Label>
                      <Textarea
                        id="health_notes"
                        placeholder="Sağlık ile ilgili notlar..."
                        rows={4}
                        value={salesInfo.health_notes || ''}
                        onChange={(e) =>
                          setValue('sales_info.health_notes', e.target.value, {
                            shouldDirty: true,
                          })
                        }
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      Müşteri Geri Bildirimleri
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <Label
                            htmlFor="trustpilot_review"
                            className="text-base"
                          >
                            Trustpilot Yorumu Yapıldı
                          </Label>
                        </div>
                        <Switch
                          id="trustpilot_review"
                          checked={salesInfo.trustpilot_review || false}
                          onCheckedChange={(checked) =>
                            setValue('sales_info.trustpilot_review', checked, {
                              shouldDirty: true,
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <Label
                            htmlFor="google_maps_review"
                            className="text-base"
                          >
                            Google Maps Yorumu Yapıldı
                          </Label>
                        </div>
                        <Switch
                          id="google_maps_review"
                          checked={salesInfo.google_maps_review || false}
                          onCheckedChange={(checked) =>
                            setValue('sales_info.google_maps_review', checked, {
                              shouldDirty: true,
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <Label
                            htmlFor="satisfaction_survey"
                            className="text-base"
                          >
                            Memnuniyet Anketi Dolduruldu
                          </Label>
                        </div>
                        <Switch
                          id="satisfaction_survey"
                          checked={salesInfo.satisfaction_survey || false}
                          onCheckedChange={(checked) =>
                            setValue(
                              'sales_info.satisfaction_survey',
                              checked,
                              { shouldDirty: true }
                            )
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <Label htmlFor="warranty_sent" className="text-base">
                            Garanti Belgesi Gönderildi
                          </Label>
                        </div>
                        <Switch
                          id="warranty_sent"
                          checked={salesInfo.warranty_sent || false}
                          onCheckedChange={(checked) =>
                            setValue('sales_info.warranty_sent', checked, {
                              shouldDirty: true,
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <Label htmlFor="rpt" className="text-base">
                            RPT
                          </Label>
                        </div>
                        <Switch
                          id="rpt"
                          checked={salesInfo.rpt || false}
                          onCheckedChange={(checked) =>
                            setValue('sales_info.rpt', checked, {
                              shouldDirty: true,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        Seyahat Detayları
                      </h3>
                      <Button onClick={addTravel} size="sm">
                        Yeni Seyahat Ekle
                      </Button>
                    </div>

                    {travelInfo.length === 0 ? (
                      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed">
                        <div className="text-center">
                          <p className="text-muted-foreground">
                            Henüz seyahat kaydı yok
                          </p>
                          <Button
                            onClick={addTravel}
                            variant="outline"
                            size="sm"
                            className="mt-4"
                          >
                            İlk Seyahati Ekle
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {travelInfo.map((travel, index) => (
                          <div
                            key={index}
                            className="space-y-6 rounded-lg border p-6"
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="text-lg font-semibold">
                                {index + 1}. Seyahat
                              </h4>
                              <Button
                                onClick={() => deleteTravel(index)}
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                              >
                                Sil
                              </Button>
                            </div>

                            <div className="space-y-4">
                              <h5 className="font-medium">Randevu Bilgileri</h5>

                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                  <Label htmlFor={`appointment_date_${index}`}>
                                    Randevu Tarihi
                                  </Label>
                                  <Input
                                    id={`appointment_date_${index}`}
                                    type="date"
                                    value={travel.appointment_date || ''}
                                    onChange={(e) =>
                                      updateTravel(
                                        index,
                                        'appointment_date',
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor={`appointment_time_${index}`}>
                                    Randevu Saati
                                  </Label>
                                  <Input
                                    id={`appointment_time_${index}`}
                                    type="time"
                                    value={travel.appointment_time || ''}
                                    onChange={(e) =>
                                      updateTravel(
                                        index,
                                        'appointment_time',
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`doctor_id_${index}`}>
                                  Doktor
                                </Label>
                                <Select
                                  value={
                                    travel.doctor_id
                                      ? String(travel.doctor_id)
                                      : ''
                                  }
                                  onValueChange={(value) =>
                                    updateTravel(
                                      index,
                                      'doctor_id',
                                      Number(value)
                                    )
                                  }
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Doktor Seçin" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {doctors.map(
                                      (doctor: {
                                        id: number;
                                        name: string;
                                      }) => (
                                        <SelectItem
                                          key={doctor.id}
                                          value={String(doctor.id)}
                                        >
                                          {doctor.name}
                                        </SelectItem>
                                      )
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label>Tedavi Planı</Label>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="w-full justify-start"
                                  onClick={() => {
                                    setCurrentTravelIndex(index);
                                    setTeethDialogOpen(true);
                                  }}
                                >
                                  {travel.teeth && travel.teeth.length > 0
                                    ? `Seçilen Dişler: ${travel.teeth
                                        .map((t) => t.tooth_number)
                                        .sort((a, b) => a - b)
                                        .join(', ')}`
                                    : 'Diş Seç'}
                                </Button>
                              </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id={`is_custom_hotel_${index}`}
                                  checked={travel.is_custom_hotel || false}
                                  onCheckedChange={(checked) =>
                                    updateTravel(
                                      index,
                                      'is_custom_hotel',
                                      checked
                                    )
                                  }
                                />
                                <Label htmlFor={`is_custom_hotel_${index}`}>
                                  Özel Otel
                                </Label>
                              </div>

                              {travel.is_custom_hotel ? (
                                <div className="space-y-2">
                                  <Label htmlFor={`hotel_name_${index}`}>
                                    Otel Adı
                                  </Label>
                                  <Input
                                    id={`hotel_name_${index}`}
                                    placeholder="Otel adını girin"
                                    value={travel.hotel_name || ''}
                                    onChange={(e) =>
                                      updateTravel(
                                        index,
                                        'hotel_name',
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <Label htmlFor={`hotel_id_${index}`}>
                                    Otel
                                  </Label>
                                  <Select
                                    value={
                                      travel.hotel_id
                                        ? String(travel.hotel_id)
                                        : ''
                                    }
                                    onValueChange={(value) =>
                                      updateTravel(
                                        index,
                                        'hotel_id',
                                        Number(value)
                                      )
                                    }
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Otel Seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {hotels.map(
                                        (hotel: {
                                          id: number;
                                          name: string;
                                        }) => (
                                          <SelectItem
                                            key={hotel.id}
                                            value={String(hotel.id)}
                                          >
                                            {hotel.name}
                                          </SelectItem>
                                        )
                                      )}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}

                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                  <Label htmlFor={`room_type_${index}`}>
                                    Oda Tipi
                                  </Label>
                                  <Input
                                    id={`room_type_${index}`}
                                    placeholder="Örn: Tek Kişilik, Çift Kişilik"
                                    value={travel.room_type || ''}
                                    onChange={(e) =>
                                      updateTravel(
                                        index,
                                        'room_type',
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor={`person_count_${index}`}>
                                    Kişi Sayısı
                                  </Label>
                                  <Input
                                    id={`person_count_${index}`}
                                    placeholder="Örn: 1, 2, 3"
                                    value={travel.person_count || ''}
                                    onChange={(e) =>
                                      updateTravel(
                                        index,
                                        'person_count',
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                              </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id={`is_custom_transfer_${index}`}
                                  checked={travel.is_custom_transfer || false}
                                  onCheckedChange={(checked) =>
                                    updateTravel(
                                      index,
                                      'is_custom_transfer',
                                      checked
                                    )
                                  }
                                />
                                <Label htmlFor={`is_custom_transfer_${index}`}>
                                  Özel Transfer
                                </Label>
                              </div>

                              {travel.is_custom_transfer ? (
                                <div className="space-y-2">
                                  <Label htmlFor={`transfer_name_${index}`}>
                                    Transfer Adı
                                  </Label>
                                  <Input
                                    id={`transfer_name_${index}`}
                                    placeholder="Transfer firması adını girin"
                                    value={travel.transfer_name || ''}
                                    onChange={(e) =>
                                      updateTravel(
                                        index,
                                        'transfer_name',
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <Label htmlFor={`transfer_id_${index}`}>
                                    Transfer
                                  </Label>
                                  <Select
                                    value={
                                      travel.transfer_id
                                        ? String(travel.transfer_id)
                                        : ''
                                    }
                                    onValueChange={(value) =>
                                      updateTravel(
                                        index,
                                        'transfer_id',
                                        Number(value)
                                      )
                                    }
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Transfer Seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {transfers.map(
                                        (transfer: {
                                          id: number;
                                          name: string;
                                        }) => (
                                          <SelectItem
                                            key={transfer.id}
                                            value={String(transfer.id)}
                                          >
                                            {transfer.name}
                                          </SelectItem>
                                        )
                                      )}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                            </div>

                            <Separator />

                            <div className="space-y-4">
                              <h5 className="font-medium">Geliş Bilgileri</h5>

                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                  <Label htmlFor={`arrival_date_${index}`}>
                                    Geliş Tarihi
                                  </Label>
                                  <Input
                                    id={`arrival_date_${index}`}
                                    type="date"
                                    value={travel.arrival_date || ''}
                                    onChange={(e) =>
                                      updateTravel(
                                        index,
                                        'arrival_date',
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor={`arrival_time_${index}`}>
                                    Geliş Saati
                                  </Label>
                                  <Input
                                    id={`arrival_time_${index}`}
                                    type="time"
                                    value={travel.arrival_time || ''}
                                    onChange={(e) =>
                                      updateTravel(
                                        index,
                                        'arrival_time',
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`arrival_flight_code_${index}`}>
                                  Uçuş Kodu
                                </Label>
                                <Input
                                  id={`arrival_flight_code_${index}`}
                                  placeholder="Örn: TK1234"
                                  value={travel.arrival_flight_code || ''}
                                  onChange={(e) =>
                                    updateTravel(
                                      index,
                                      'arrival_flight_code',
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                              <h5 className="font-medium">Dönüş Bilgileri</h5>

                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                  <Label htmlFor={`departure_date_${index}`}>
                                    Dönüş Tarihi
                                  </Label>
                                  <Input
                                    id={`departure_date_${index}`}
                                    type="date"
                                    value={travel.departure_date || ''}
                                    onChange={(e) =>
                                      updateTravel(
                                        index,
                                        'departure_date',
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor={`departure_time_${index}`}>
                                    Dönüş Saati
                                  </Label>
                                  <Input
                                    id={`departure_time_${index}`}
                                    type="time"
                                    value={travel.departure_time || ''}
                                    onChange={(e) =>
                                      updateTravel(
                                        index,
                                        'departure_time',
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label
                                  htmlFor={`departure_flight_code_${index}`}
                                >
                                  Uçuş Kodu
                                </Label>
                                <Input
                                  id={`departure_flight_code_${index}`}
                                  placeholder="Örn: TK1235"
                                  value={travel.departure_flight_code || ''}
                                  onChange={(e) =>
                                    updateTravel(
                                      index,
                                      'departure_flight_code',
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                              <Label htmlFor={`notes_${index}`}>Notlar</Label>
                              <Textarea
                                id={`notes_${index}`}
                                placeholder="Seyahat ile ilgili notlar..."
                                rows={3}
                                value={travel.notes || ''}
                                onChange={(e) =>
                                  updateTravel(index, 'notes', e.target.value)
                                }
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeSection === 'payments' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Ödeme Bilgileri</h3>

                  <div className="space-y-2">
                    <Label htmlFor="payment_notes">Ödeme Notları</Label>
                    <Textarea
                      id="payment_notes"
                      placeholder="Ödeme ile ilgili notlar..."
                      rows={10}
                      value={watch('payment_notes') || ''}
                      onChange={(e) =>
                        setValue('payment_notes', e.target.value, {
                          shouldDirty: true,
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {activeSection === 'files' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Dosyalar</h3>

                  <PermissionGuard permission="customer_FileUpload">
                    <div
                      onDrop={handleFileDrop}
                      onDragOver={handleDragOver}
                      className="border-muted-foreground/25 hover:border-muted-foreground/50 relative rounded-lg border-2 border-dashed p-8 text-center transition-colors"
                    >
                      <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        disabled={uploadFilesMutation.isPending}
                      />
                      <Upload className="text-muted-foreground mx-auto mb-4 h-10 w-10" />
                      <p className="mb-2 text-lg font-medium">
                        Dosyaları buraya sürükleyin veya tıklayın
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Birden fazla dosya seçebilirsiniz (Max: 100MB/dosya)
                      </p>
                    </div>
                  </PermissionGuard>

                  {isFilesLoading ? (
                    <div className="flex min-h-[200px] items-center justify-center">
                      <p className="text-muted-foreground">Yükleniyor...</p>
                    </div>
                  ) : customerFiles.length === 0 ? (
                    <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed">
                      <div className="text-center">
                        <FileText className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
                        <p className="text-muted-foreground">
                          Henüz dosya yüklenmemiş
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {customerFiles.map(
                        (file: {
                          id: number;
                          title: string;
                          key: string;
                          created_at: string;
                        }) => (
                          <div
                            key={file.id}
                            className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors"
                          >
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                              <FileText className="text-muted-foreground h-5 w-5 flex-shrink-0" />
                              {editingFileId === file.id ? (
                                <div className="flex flex-1 items-center gap-2">
                                  <Input
                                    value={editingFileName}
                                    onChange={(e) =>
                                      setEditingFileName(e.target.value)
                                    }
                                    className="flex-1"
                                    autoFocus
                                    placeholder="Dosya adı (uzantısız)"
                                  />
                                  <span className="text-muted-foreground text-sm">
                                    {file.title.substring(
                                      file.title.lastIndexOf('.')
                                    )}
                                  </span>
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      saveFileName(file.id, file.title)
                                    }
                                    disabled={updateFileMutation.isPending}
                                  >
                                    Kaydet
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={cancelEditingFile}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate font-medium">
                                      {file.title}
                                    </p>
                                    <p className="text-muted-foreground text-xs">
                                      {new Date(
                                        file.created_at
                                      ).toLocaleDateString('tr-TR')}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        window.open(
                                          `${import.meta.env.VITE_STORAGE_URL}/${file.key}`,
                                          '_blank'
                                        )
                                      }
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                    <PermissionGuard permission="customer_FileUpload">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() =>
                                          startEditingFile(file.id, file.title)
                                        }
                                      >
                                        <Edit2 className="h-4 w-4" />
                                      </Button>
                                    </PermissionGuard>
                                    <PermissionGuard permission="customer_FileDelete">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-destructive hover:text-destructive"
                                        onClick={() =>
                                          deleteFileMutation.mutate(file.id)
                                        }
                                        disabled={deleteFileMutation.isPending}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </PermissionGuard>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'history' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Değişiklik Geçmişi</h3>

                  {isLogsLoading ? (
                    <div className="flex min-h-[300px] items-center justify-center">
                      <p className="text-muted-foreground">Yükleniyor...</p>
                    </div>
                  ) : customerLogs.length === 0 ? (
                    <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-dashed">
                      <div className="text-center">
                        <History className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
                        <p className="text-muted-foreground">
                          Henüz değişiklik kaydı yok
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative space-y-4">
                      <div className="bg-border absolute top-0 bottom-0 left-4 w-0.5" />

                      {customerLogs.map(
                        (log: {
                          id: number;
                          field_name: string;
                          old_value: string;
                          new_value: string;
                          action_type: string;
                          created_at: string;
                          user?: { name: string };
                        }) => (
                          <div key={log.id} className="relative pl-12">
                            <div className="border-primary bg-background absolute top-2 left-2.5 h-3 w-3 rounded-full border-2" />

                            <div className="space-y-2 rounded-lg border p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium">
                                    {getFieldNameInTurkish(log.field_name)}
                                  </p>
                                  <p className="text-muted-foreground text-sm">
                                    {log.action_type === 'create'
                                      ? 'Oluşturuldu'
                                      : 'Güncellendi'}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-muted-foreground text-sm">
                                    {new Date(
                                      log.created_at
                                    ).toLocaleDateString('tr-TR', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                    })}
                                  </p>
                                  <p className="text-muted-foreground text-sm">
                                    {new Date(
                                      log.created_at
                                    ).toLocaleTimeString('tr-TR', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </p>
                                </div>
                              </div>

                              {log.action_type === 'update' && (
                                <div className="pt-2">
                                  {isJsonObject(log.old_value) ||
                                  isJsonObject(log.new_value) ? (
                                    <div className="grid gap-2 md:grid-cols-2">
                                      <div className="bg-muted/50 rounded p-3">
                                        <p className="text-muted-foreground mb-2 text-xs font-medium">
                                          Eski Değer
                                        </p>
                                        <div className="space-y-1.5">
                                          {(() => {
                                            try {
                                              const oldParsed = log.old_value
                                                ? JSON.parse(log.old_value)
                                                : {};
                                              return Object.entries(
                                                oldParsed
                                              ).map(([key, value]) => (
                                                <div
                                                  key={key}
                                                  className="text-sm"
                                                >
                                                  <span className="font-medium">
                                                    {key}:
                                                  </span>{' '}
                                                  <span className="text-muted-foreground">
                                                    {formatJsonValue(value)}
                                                  </span>
                                                </div>
                                              ));
                                            } catch {
                                              return (
                                                <p className="text-sm break-words">
                                                  {formatLogValue(
                                                    log.old_value,
                                                    log.field_name
                                                  )}
                                                </p>
                                              );
                                            }
                                          })()}
                                        </div>
                                      </div>
                                      <div className="bg-primary/10 rounded p-3">
                                        <p className="text-muted-foreground mb-2 text-xs font-medium">
                                          Yeni Değer
                                        </p>
                                        <div className="space-y-1.5">
                                          {(() => {
                                            try {
                                              const newParsed = log.new_value
                                                ? JSON.parse(log.new_value)
                                                : {};
                                              return Object.entries(
                                                newParsed
                                              ).map(([key, value]) => (
                                                <div
                                                  key={key}
                                                  className="text-sm"
                                                >
                                                  <span className="font-medium">
                                                    {key}:
                                                  </span>{' '}
                                                  <span className="text-muted-foreground">
                                                    {formatJsonValue(value)}
                                                  </span>
                                                </div>
                                              ));
                                            } catch {
                                              return (
                                                <p className="text-sm break-words">
                                                  {formatLogValue(
                                                    log.new_value,
                                                    log.field_name
                                                  )}
                                                </p>
                                              );
                                            }
                                          })()}
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="grid gap-2 md:grid-cols-2">
                                      <div className="bg-muted/50 rounded p-3">
                                        <p className="text-muted-foreground mb-1 text-xs font-medium">
                                          Eski Değer
                                        </p>
                                        <p className="text-sm break-words">
                                          {formatLogValue(
                                            log.old_value,
                                            log.field_name
                                          )}
                                        </p>
                                      </div>
                                      <div className="bg-primary/10 rounded p-3">
                                        <p className="text-muted-foreground mb-1 text-xs font-medium">
                                          Yeni Değer
                                        </p>
                                        <p className="text-sm break-words">
                                          {formatLogValue(
                                            log.new_value,
                                            log.field_name
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {log.user && (
                                <p className="text-muted-foreground pt-2 text-xs">
                                  Değiştiren: {log.user.name}
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </Main>

      {currentTravelIndex !== null && (
        <CustomersTeethDialog
          open={teethDialogOpen}
          onOpenChange={setTeethDialogOpen}
          selectedTeeth={travelInfo[currentTravelIndex]?.teeth || []}
          onTeethChange={(teeth) => {
            updateTravel(currentTravelIndex, 'teeth', teeth);
            setCurrentTravelIndex(null);
          }}
        />
      )}
    </>
  );
}
