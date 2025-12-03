'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { MultiSelect } from '@/components/multi-select';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { ThemeSwitch } from '@/components/theme-switch';
import { ForbiddenError } from '@/features/errors/forbidden';
import { GeneralError } from '@/features/errors/general-error';
import { NotFoundError } from '@/features/errors/not-found-error';
import {
  type Customer,
  type PhoneCall,
  type SalesInfo,
  type TravelInfo,
} from '../data/schema';

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

  const [formData, setFormData] = useState({
    user_id: 0,
    category_id: 0,
    status_id: 0,
    service_ids: [] as number[],
    name: '',
    email: '',
    phone: '',
    country: '',
    notes: '',
    payment_notes: '',
    ad_name: '',
    adset_name: '',
    campaign_name: '',
    lead_form_id: '',
    created_at: '',
    reminder_enabled: false,
    reminder_date: '',
    reminder_notes: '',
  });

  const [phoneCalls, setPhoneCalls] = useState<PhoneCall[]>([]);
  const [salesInfo, setSalesInfo] = useState<SalesInfo>({
    sales_date: '',
    trustpilot_review: false,
    google_maps_review: false,
    satisfaction_survey: false,
    warranty_sent: false,
    rpt: false,
    health_notes: '',
  });
  const [travelInfo, setTravelInfo] = useState<TravelInfo[]>([]);
  const [editingFileId, setEditingFileId] = useState<number | null>(null);
  const [editingFileName, setEditingFileName] = useState('');

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
      setFormData({
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
        ad_name: customer.ad_name || '',
        adset_name: customer.adset_name || '',
        campaign_name: customer.campaign_name || '',
        lead_form_id: customer.lead_form_id || '',
        created_at: customer.created_at?.toString() || '',
        reminder_enabled: customer.reminder?.status || false,
        reminder_date: customer.reminder?.date || '',
        reminder_notes: customer.reminder?.notes || '',
      });
      setPhoneCalls(customer.phone_calls || []);
      if (customer.sales_info) {
        setSalesInfo({
          sales_date: customer.sales_info.sales_date || '',
          trustpilot_review: customer.sales_info.trustpilot_review || false,
          google_maps_review: customer.sales_info.google_maps_review || false,
          satisfaction_survey: customer.sales_info.satisfaction_survey || false,
          warranty_sent: customer.sales_info.warranty_sent || false,
          rpt: customer.sales_info.rpt || false,
          health_notes: customer.sales_info.health_notes || '',
        });
      }
      if (customer.travel_info && Array.isArray(customer.travel_info)) {
        setTravelInfo(customer.travel_info);
      }
    }
  }, [customer]);

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
        error instanceof Error ? error.message : 'Bir hata oluştu.';
      toast.error('Hata', {
        description: errorMessage,
      });
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = () => {
    const {
      ad_name,
      adset_name,
      campaign_name,
      lead_form_id,
      reminder_enabled,
      reminder_date,
      reminder_notes,
      ...restFormData
    } = formData;

    const dataToSave: Record<string, unknown> = {
      user_id: restFormData.user_id,
      category_id: restFormData.category_id,
      status_id: restFormData.status_id,
      name: restFormData.name,
      email: restFormData.email,
      phone: restFormData.phone,
      country: restFormData.country,
      notes: restFormData.notes,
      phone_calls: phoneCalls,
      reminder: {
        status: formData.reminder_enabled,
        date: formData.reminder_date,
        notes: formData.reminder_notes,
      },
      payment_notes: restFormData.payment_notes,
      service_ids: formData.service_ids,
      sales_info: salesInfo,
      travel_info: travelInfo,
    };
    updateMutation.mutate(dataToSave);
  };

  const addPhoneCall = () => {
    setPhoneCalls([
      ...phoneCalls,
      {
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        notes: '',
      },
    ]);
  };

  const updatePhoneCall = (
    index: number,
    field: 'date' | 'time' | 'notes',
    value: string
  ) => {
    const updated = [...phoneCalls];
    updated[index][field] = value;
    setPhoneCalls(updated);
  };

  const deletePhoneCall = (index: number) => {
    setPhoneCalls(phoneCalls.filter((_, i) => i !== index));
  };

  const addTravel = () => {
    setTravelInfo([
      ...travelInfo,
      {
        appointment_date: '',
        appointment_time: '',
        doctor_id: null,
        service: '',
        is_custom_hotel: false,
        partner_hotel_id: null,
        hotel_name: '',
        is_custom_transfer: false,
        partner_transfer_id: null,
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
    ]);
  };

  const updateTravel = (
    index: number,
    field: keyof TravelInfo,
    value: unknown
  ) => {
    const updated = [...travelInfo];
    (updated[index] as unknown as Record<string, unknown>)[field] = value;
    setTravelInfo(updated);
  };

  const deleteTravel = (index: number) => {
    setTravelInfo(travelInfo.filter((_, i) => i !== index));
  };

  const getFieldNameInTurkish = (fieldName: string) => {
    const fieldNames: Record<string, string> = {
      name: 'Ad Soyad',
      email: 'E-Posta',
      phone: 'Telefon',
      country: 'Ülke',
      notes: 'Notlar',
      created_at: 'Kayıt Tarihi',
      user_id: 'Danışman',
      category_id: 'Kategori',
      status_id: 'Durum',
      reminder: 'Hatırlatıcı',
      phone_calls: 'Telefon Görüşmeleri',
      payment_notes: 'Ödeme Notları',
      ad_name: 'Reklam Adı',
      adset_name: 'Reklam Grubu Adı',
      campaign_name: 'Kampanya Adı',
      lead_form_id: 'Lead Form ID',
    };
    return fieldNames[fieldName] || fieldName;
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
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fluid>
        <div className="mb-4 flex items-center justify-between lg:mb-6">
          <div className="space-y-0.5">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {customer?.name}
            </h1>
            <p className="text-muted-foreground">#{customerId}</p>
          </div>

          <PermissionGuard permission="customer_Edit">
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
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

          <div className="flex w-full flex-col overflow-y-hidden p-1">
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
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        Telefon <span className="text-destructive">*</span>
                      </Label>
                      {formData.phone !== '' && (
                        <PhoneInput
                          defaultCountry="tr"
                          value={formData.phone}
                          onChange={(phone) =>
                            setFormData((prev) => ({ ...prev, phone }))
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
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">
                        Ülke <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.country}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, country: value }))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Ülke seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {countryOptions.map((country) => (
                            <SelectItem
                              key={country.value}
                              value={country.value}
                            >
                              {country.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notlar</Label>
                    <Textarea
                      id="notes"
                      placeholder="Müşteri hakkında notlar..."
                      rows={4}
                      value={formData.notes}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="created_at">Kayıt Tarihi</Label>
                    <Input
                      id="created_at"
                      type="datetime-local"
                      value={
                        formData.created_at
                          ? new Date(
                              new Date(formData.created_at).getTime() -
                                new Date(
                                  formData.created_at
                                ).getTimezoneOffset() *
                                  60000
                            )
                              .toISOString()
                              .slice(0, 16)
                          : ''
                      }
                      onChange={handleInputChange}
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
                          value={formData.ad_name}
                          disabled
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="adset_name">Reklam Grubu Adı</Label>
                        <Input
                          id="adset_name"
                          placeholder="Reklam Grubu Adı"
                          value={formData.adset_name}
                          disabled
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="campaign_name">Kampanya Adı</Label>
                        <Input
                          id="campaign_name"
                          placeholder="Kampanya Adı"
                          value={formData.campaign_name}
                          disabled
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lead_form_id">Lead Form ID</Label>
                        <Input
                          id="lead_form_id"
                          placeholder="Lead Form ID"
                          value={formData.lead_form_id}
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
                      <Select
                        value={formData.user_id ? String(formData.user_id) : ''}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            user_id: Number(value),
                          }))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Danışman seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {userOptions.map(
                            (user: { value: string; label: string }) => (
                              <SelectItem key={user.value} value={user.value}>
                                {user.label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category_id">
                        Kategori <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={
                          formData.category_id
                            ? String(formData.category_id)
                            : ''
                        }
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            category_id: Number(value),
                          }))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Kategori seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryOptions.map(
                            (category: { value: string; label: string }) => (
                              <SelectItem
                                key={category.value}
                                value={category.value}
                              >
                                {category.label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status_id">
                        Durum <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={
                          formData.status_id ? String(formData.status_id) : ''
                        }
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            status_id: Number(value),
                          }))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Durum seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map(
                            (status: { value: string; label: string }) => (
                              <SelectItem
                                key={status.value}
                                value={status.value}
                              >
                                {status.label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="service_ids">Hizmetler</Label>
                      <MultiSelect
                        options={serviceOptions}
                        defaultValue={formData.service_ids.map(String)}
                        onValueChange={(values) =>
                          setFormData((prev) => ({
                            ...prev,
                            service_ids: values.map(Number),
                          }))
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
                      checked={formData.reminder_enabled}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          reminder_enabled: checked,
                        }))
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
                        formData.reminder_date
                          ? new Date(
                              new Date(formData.reminder_date).getTime() -
                                new Date(
                                  formData.reminder_date
                                ).getTimezoneOffset() *
                                  60000
                            )
                              .toISOString()
                              .slice(0, 16)
                          : ''
                      }
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          reminder_date: e.target.value,
                        }))
                      }
                      disabled={!formData.reminder_enabled}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reminder_notes">Hatırlatma Notları</Label>
                    <Textarea
                      id="reminder_notes"
                      placeholder="Hatırlatma ile ilgili notlar..."
                      rows={6}
                      value={formData.reminder_notes}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          reminder_notes: e.target.value,
                        }))
                      }
                      disabled={!formData.reminder_enabled}
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
                          className="space-y-4 rounded-lg border p-4"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">
                              {index + 1}. Görüşme
                            </h4>
                            <Button
                              onClick={() => deletePhoneCall(index)}
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                            >
                              Sil
                            </Button>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor={`call-date-${index}`}>
                                Görüşme Tarihi
                              </Label>
                              <Input
                                id={`call-date-${index}`}
                                type="date"
                                value={call.date}
                                onChange={(e) =>
                                  updatePhoneCall(index, 'date', e.target.value)
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`call-time-${index}`}>
                                Görüşme Saati
                              </Label>
                              <Input
                                id={`call-time-${index}`}
                                type="time"
                                value={call.time}
                                onChange={(e) =>
                                  updatePhoneCall(index, 'time', e.target.value)
                                }
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`call-notes-${index}`}>
                              Görüşme Notları
                            </Label>
                            <Textarea
                              id={`call-notes-${index}`}
                              placeholder="Görüşme notlarını buraya yazın..."
                              rows={3}
                              value={call.notes}
                              onChange={(e) =>
                                updatePhoneCall(index, 'notes', e.target.value)
                              }
                            />
                          </div>
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
                      <Label htmlFor="sales_date">Satış Tarihi</Label>
                      <Input
                        id="sales_date"
                        type="date"
                        value={salesInfo.sales_date}
                        onChange={(e) =>
                          setSalesInfo((prev) => ({
                            ...prev,
                            sales_date: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="health_notes">Sağlık Notları</Label>
                      <Textarea
                        id="health_notes"
                        placeholder="Sağlık ile ilgili notlar..."
                        rows={4}
                        value={salesInfo.health_notes}
                        onChange={(e) =>
                          setSalesInfo((prev) => ({
                            ...prev,
                            health_notes: e.target.value,
                          }))
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
                          checked={salesInfo.trustpilot_review}
                          onCheckedChange={(checked) =>
                            setSalesInfo((prev) => ({
                              ...prev,
                              trustpilot_review: checked,
                            }))
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
                          checked={salesInfo.google_maps_review}
                          onCheckedChange={(checked) =>
                            setSalesInfo((prev) => ({
                              ...prev,
                              google_maps_review: checked,
                            }))
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
                          checked={salesInfo.satisfaction_survey}
                          onCheckedChange={(checked) =>
                            setSalesInfo((prev) => ({
                              ...prev,
                              satisfaction_survey: checked,
                            }))
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
                          checked={salesInfo.warranty_sent}
                          onCheckedChange={(checked) =>
                            setSalesInfo((prev) => ({
                              ...prev,
                              warranty_sent: checked,
                            }))
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
                          checked={salesInfo.rpt}
                          onCheckedChange={(checked) =>
                            setSalesInfo((prev) => ({
                              ...prev,
                              rpt: checked,
                            }))
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
                                    value={travel.appointment_date}
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
                                    value={travel.appointment_time}
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
                                <Label htmlFor={`service_${index}`}>
                                  Hizmet
                                </Label>
                                <Input
                                  id={`service_${index}`}
                                  placeholder="Örn: 4 İmplant + 24 Kuron"
                                  value={travel.service}
                                  onChange={(e) =>
                                    updateTravel(
                                      index,
                                      'service',
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id={`is_custom_hotel_${index}`}
                                  checked={travel.is_custom_hotel}
                                  onCheckedChange={(checked) =>
                                    updateTravel(
                                      index,
                                      'is_custom_hotel',
                                      checked
                                    )
                                  }
                                />
                                <Label htmlFor={`is_custom_hotel_${index}`}>
                                  Anlaşmalı Otel
                                </Label>
                              </div>

                              {!travel.is_custom_hotel ? (
                                <div className="space-y-2">
                                  <Label htmlFor={`partner_hotel_id_${index}`}>
                                    Otel
                                  </Label>
                                  <Select
                                    value={
                                      travel.partner_hotel_id
                                        ? String(travel.partner_hotel_id)
                                        : ''
                                    }
                                    onValueChange={(value) =>
                                      updateTravel(
                                        index,
                                        'partner_hotel_id',
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
                              ) : (
                                <div className="space-y-2">
                                  <Label htmlFor={`hotel_name_${index}`}>
                                    Otel Adı
                                  </Label>
                                  <Input
                                    id={`hotel_name_${index}`}
                                    placeholder="Otel adını girin"
                                    value={travel.hotel_name}
                                    onChange={(e) =>
                                      updateTravel(
                                        index,
                                        'hotel_name',
                                        e.target.value
                                      )
                                    }
                                  />
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
                                    value={travel.room_type}
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
                                    value={travel.person_count}
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
                                  checked={travel.is_custom_transfer}
                                  onCheckedChange={(checked) =>
                                    updateTravel(
                                      index,
                                      'is_custom_transfer',
                                      checked
                                    )
                                  }
                                />
                                <Label htmlFor={`is_custom_transfer_${index}`}>
                                  Anlaşmalı Transfer
                                </Label>
                              </div>

                              {!travel.is_custom_transfer ? (
                                <div className="space-y-2">
                                  <Label
                                    htmlFor={`partner_transfer_id_${index}`}
                                  >
                                    Transfer
                                  </Label>
                                  <Select
                                    value={
                                      travel.partner_transfer_id
                                        ? String(travel.partner_transfer_id)
                                        : ''
                                    }
                                    onValueChange={(value) =>
                                      updateTravel(
                                        index,
                                        'partner_transfer_id',
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
                              ) : (
                                <div className="space-y-2">
                                  <Label htmlFor={`transfer_name_${index}`}>
                                    Transfer Adı
                                  </Label>
                                  <Input
                                    id={`transfer_name_${index}`}
                                    placeholder="Transfer firması adını girin"
                                    value={travel.transfer_name}
                                    onChange={(e) =>
                                      updateTravel(
                                        index,
                                        'transfer_name',
                                        e.target.value
                                      )
                                    }
                                  />
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
                                    value={travel.arrival_date}
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
                                    value={travel.arrival_time}
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
                                  value={travel.arrival_flight_code}
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
                                    value={travel.departure_date}
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
                                    value={travel.departure_time}
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
                                  value={travel.departure_flight_code}
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
                                value={travel.notes}
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
                      value={formData.payment_notes}
                      onChange={handleInputChange}
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
                                <div className="grid gap-2 pt-2 md:grid-cols-2">
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
          </div>
        </div>
      </Main>
    </>
  );
}
