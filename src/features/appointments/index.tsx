import { useState } from 'react';
import { format, parse, subHours } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { getAppointments } from '@/services/appointment-service';
import { tr } from 'date-fns/locale';
import { CalendarDays, Download } from 'lucide-react';
import { utils, writeFile } from 'xlsx';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { LeadSwitch } from '@/components/lead-switch';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { ThemeSwitch } from '@/components/theme-switch';
import { AppointmentsDialogs } from './components/appointments-dialogs';
import { AppointmentsProvider } from './components/appointments-provider';
import { AppointmentsTable } from './components/appointments-table';
import { type Appointment } from './data/schema';

export function Appointments() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const {
    data: appointments = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['appointments', selectedMonth, selectedYear],
    queryFn: () =>
      getAppointments({ month: selectedMonth, year: selectedYear }),
  });

  const months = [
    { value: 1, label: 'Ocak' },
    { value: 2, label: 'Şubat' },
    { value: 3, label: 'Mart' },
    { value: 4, label: 'Nisan' },
    { value: 5, label: 'Mayıs' },
    { value: 6, label: 'Haziran' },
    { value: 7, label: 'Temmuz' },
    { value: 8, label: 'Ağustos' },
    { value: 9, label: 'Eylül' },
    { value: 10, label: 'Ekim' },
    { value: 11, label: 'Kasım' },
    { value: 12, label: 'Aralık' },
  ];

  const years = Array.from(
    { length: 5 },
    (_, i) => currentDate.getFullYear() - 2 + i
  );

  const exportToExcel = () => {
    if (!appointments.length) {
      return;
    }

    // Excel için veri hazırla
    const excelData = appointments.map((appointment: Appointment) => {
      const travelInfo = appointment.travel_info[0];

      // Dönüş alınma saatini hesapla
      let pickupTime = '-';
      if (travelInfo) {
        try {
          const departureDateTime = parse(
            `${travelInfo.departure_date} ${travelInfo.departure_time}`,
            'yyyy-MM-dd HH:mm',
            new Date()
          );
          const pickup = subHours(departureDateTime, 3);
          pickupTime = format(pickup, 'HH:mm', { locale: tr });
        } catch (_error) {
          pickupTime = '-';
        }
      }

      return {
        ID: appointment.id,
        'Müşteri Adı': appointment.name,
        Email: appointment.email || '-',
        'Randevu Tarihi': travelInfo
          ? format(new Date(travelInfo.appointment_date), 'dd MMMM yyyy', {
              locale: tr,
            })
          : '-',
        'Randevu Saati': travelInfo?.appointment_time || '-',
        Seyahat: `${appointment.travel_count}. Seyahat`,
        Doktor: travelInfo?.doctor?.name || '-',
        Hizmetler: appointment.services
          .map((s: { title: string }) => s.title)
          .join(', '),
        'Geliş Tarihi': travelInfo
          ? format(new Date(travelInfo.arrival_date), 'dd MMMM yyyy', {
              locale: tr,
            })
          : '-',
        'Geliş Saati': travelInfo?.arrival_time || '-',
        'Geliş Uçak': travelInfo?.arrival_flight_code || '-',
        'Gidiş Tarihi': travelInfo
          ? format(new Date(travelInfo.departure_date), 'dd MMMM yyyy', {
              locale: tr,
            })
          : '-',
        'Gidiş Saati': travelInfo?.departure_time || '-',
        'Gidiş Uçak': travelInfo?.departure_flight_code || '-',
        'Dönüş Alınma Saati (3 saat öncesi)': pickupTime,
        Otel:
          travelInfo?.partner_hotel?.name ||
          travelInfo?.hotel_name ||
          'Özel Otel',
        'Oda Tipi': travelInfo?.room_type || '-',
        Transfer:
          travelInfo?.partner_transfer?.name ||
          travelInfo?.transfer_name ||
          'Özel Transfer',
        Danışman: appointment.user.name,
        Notlar: travelInfo?.notes || '-',
      };
    });

    // Excel workbook oluştur
    const worksheet = utils.json_to_sheet(excelData);
    const workbook = utils.book_new();

    // Worksheet'i workbook'a ekle
    utils.book_append_sheet(workbook, worksheet, 'Randevular');

    // Sütun genişliklerini ayarla
    const columnWidths = [
      { wch: 8 }, // ID
      { wch: 20 }, // Müşteri Adı
      { wch: 25 }, // Email
      { wch: 25 }, // Randevu Tarihi
      { wch: 12 }, // Randevu Saati
      { wch: 15 }, // Seyahat
      { wch: 30 }, // Doktor
      { wch: 30 }, // Hizmetler
      { wch: 25 }, // Geliş Tarihi
      { wch: 12 }, // Geliş Saati
      { wch: 15 }, // Geliş Uçak
      { wch: 25 }, // Gidiş Tarihi
      { wch: 12 }, // Gidiş Saati
      { wch: 15 }, // Gidiş Uçak
      { wch: 25 }, // Dönüş Alınma Saati
      { wch: 25 }, // Otel
      { wch: 20 }, // Oda Tipi
      { wch: 25 }, // Transfer
      { wch: 20 }, // Danışman
      { wch: 40 }, // Notlar
    ];
    worksheet['!cols'] = columnWidths;

    // Excel dosyasını indir
    writeFile(workbook, `randevular-${selectedMonth}-${selectedYear}.xlsx`);
  };

  return (
    <AppointmentsProvider>
      <Header fixed>
        <div className="ms-auto flex items-center space-x-4">
          <LeadSwitch />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fluid>
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Randevu Yönetimi
            </h2>
            <p className="text-muted-foreground">
              Müşteri randevularını buradan görüntüleyebilirsiniz.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <CalendarDays className="text-muted-foreground h-5 w-5" />
            <Select
              value={selectedMonth.toString()}
              onValueChange={(value) => setSelectedMonth(parseInt(value))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(parseInt(value))}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <PermissionGuard permission="appointment_Export">
              <Button
                variant="outline"
                size="sm"
                onClick={exportToExcel}
                disabled={!appointments.length}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Excel'e Aktar</span>
              </Button>
            </PermissionGuard>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Yenile
            </Button>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <AppointmentsTable data={appointments} isLoading={isLoading} />
        </div>
      </Main>

      <AppointmentsDialogs />
    </AppointmentsProvider>
  );
}
