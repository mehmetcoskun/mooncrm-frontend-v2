import { format, parse, subHours } from 'date-fns';
import { Link } from '@tanstack/react-router';
import { type ColumnDef } from '@tanstack/react-table';
import { tr } from 'date-fns/locale';
import { Calendar, Hotel, Plane, User, Bus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/data-table';
import { type Appointment } from '../data/schema';
import { DataTableRowActions } from './data-table-row-actions';

export const appointmentsColumns: ColumnDef<Appointment>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Müşteri Adı" />
    ),
    cell: ({ row }) => {
      const customerId = row.original.id;
      return (
        <Link
          to="/customers/$customerId"
          params={{ customerId: customerId.toString() }}
          className="flex items-center space-x-2 hover:underline"
        >
          <User className="text-muted-foreground h-4 w-4" />
          <span className="font-medium">{row.getValue('name')}</span>
        </Link>
      );
    },
  },
  {
    accessorKey: 'appointment_date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Randevu Tarihi" />
    ),
    cell: ({ row }) => {
      const travelInfo = row.original.travel_info[0];
      if (!travelInfo) return <span className="text-muted-foreground">-</span>;

      return (
        <div className="flex items-center space-x-2">
          <Calendar className="text-muted-foreground h-4 w-4" />
          <span>
            {format(new Date(travelInfo.appointment_date), 'dd MMM yyyy', {
              locale: tr,
            })}
            <br />
            <span className="text-muted-foreground text-sm">
              {travelInfo.appointment_time}
            </span>
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'travel_count',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Seyahat" />
    ),
    cell: ({ row }) => {
      const travelCount = row.original.travel_count;
      return (
        <div className="flex flex-col items-start space-y-1">
          <Badge variant="secondary" className="text-xs">
            {travelCount}. Seyahat
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: 'doctor',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Doktor" />
    ),
    cell: ({ row }) => {
      const travelInfo = row.original.travel_info[0];
      if (!travelInfo?.doctor)
        return <span className="text-muted-foreground">-</span>;

      return (
        <span className="text-sm font-medium">{travelInfo.doctor.name}</span>
      );
    },
  },
  {
    accessorKey: 'services',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Hizmetler" />
    ),
    cell: ({ row }) => {
      const services = row.original.services;
      if (!services.length)
        return <span className="text-muted-foreground">-</span>;

      return (
        <div>
          <Badge variant="outline" className="mr-1">
            {services[0].title}
          </Badge>
          {services.length > 1 && (
            <Badge variant="secondary" className="text-xs">
              +{services.length - 1}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'arrival_date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Geliş" />
    ),
    cell: ({ row }) => {
      const travelInfo = row.original.travel_info[0];
      if (!travelInfo) return <span className="text-muted-foreground">-</span>;

      return (
        <div className="flex items-center space-x-2">
          <Plane className="h-4 w-4 text-green-500" />
          <div>
            <div className="text-sm">
              {format(new Date(travelInfo.arrival_date), 'dd MMM', {
                locale: tr,
              })}
            </div>
            <div className="text-muted-foreground text-xs">
              {travelInfo.arrival_time}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'departure_date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Gidiş" />
    ),
    cell: ({ row }) => {
      const travelInfo = row.original.travel_info[0];
      if (!travelInfo) return <span className="text-muted-foreground">-</span>;

      return (
        <div className="flex items-center space-x-2">
          <Plane className="h-4 w-4 text-red-500" />
          <div>
            <div className="text-sm">
              {format(new Date(travelInfo.departure_date), 'dd MMM', {
                locale: tr,
              })}
            </div>
            <div className="text-muted-foreground text-xs">
              {travelInfo.departure_time}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'pickup_time',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Dönüş Alınma (3 saat öncesi)"
      />
    ),
    cell: ({ row }) => {
      const travelInfo = row.original.travel_info[0];
      if (!travelInfo) return <span className="text-muted-foreground">-</span>;

      const departureDateTime = parse(
        `${travelInfo.departure_date} ${travelInfo.departure_time}`,
        'yyyy-MM-dd HH:mm',
        new Date()
      );
      const pickupTime = subHours(departureDateTime, 3);

      return (
        <div className="flex flex-col items-start space-y-1">
          <Badge variant="secondary" className="text-xs font-medium">
            {format(pickupTime, 'HH:mm', { locale: tr })}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: 'hotel',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Otel" />
    ),
    cell: ({ row }) => {
      const travelInfo = row.original.travel_info[0];
      if (!travelInfo) return <span className="text-muted-foreground">-</span>;

      const hotelName =
        travelInfo.partner_hotel?.name || travelInfo.hotel_name || 'Özel Otel';

      return (
        <div className="flex items-center space-x-2">
          <Hotel className="text-muted-foreground h-4 w-4" />
          <span className="text-sm">{hotelName}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'transfer',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Transfer" />
    ),
    cell: ({ row }) => {
      const travelInfo = row.original.travel_info[0];
      if (!travelInfo) return <span className="text-muted-foreground">-</span>;

      const transferName =
        travelInfo.partner_transfer?.name ||
        travelInfo.transfer_name ||
        'Özel Transfer';

      return (
        <div className="flex items-center space-x-2">
          <Bus className="text-muted-foreground h-4 w-4" />
          <span className="text-sm">{transferName}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'consultant',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Danışman" />
    ),
    cell: ({ row }) => {
      const user = row.original.user;
      return (
        <div className="flex items-center space-x-2">
          <User className="text-muted-foreground h-4 w-4" />
          <span className="text-sm">{user.name}</span>
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
];
