import { format } from 'date-fns';
import { type ColumnDef } from '@tanstack/react-table';
import { tr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/data-table';
import type { FacebookLead } from '../data/schema';
import { DataTableRowActions } from './data-table-row-actions';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export const facebookLeadsColumns: ColumnDef<FacebookLead>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px] border-gray-300 bg-white"
      />
    ),
    meta: {
      className: cn('sticky md:table-cell start-0 z-10 rounded-tl-[inherit]'),
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px] border-gray-300 bg-white"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'full_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ad Soyad" />
    ),
    cell: ({ row }) => {
      const fullName = row.getValue('full_name') as string | null;
      return <span className="font-medium">{fullName || '-'}</span>;
    },
  },
  {
    accessorKey: 'phone_number',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Telefon" />
    ),
    cell: ({ row }) => {
      const phone = row.getValue('phone_number') as string | null;
      return <span>{phone || '-'}</span>;
    },
  },
  {
    accessorKey: 'page_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sayfa" />
    ),
    cell: ({ row }) => {
      const pageName = row.getValue('page_name') as string;
      return (
        <Badge variant="outline" className="font-normal">
          {pageName}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'campaign_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kampanya" />
    ),
    cell: ({ row }) => {
      const campaignName = row.getValue('campaign_name') as string | null;
      const isOrganic = row.original.is_organic;

      if (isOrganic) {
        return (
          <Badge variant="secondary" className="font-normal">
            Organik
          </Badge>
        );
      }

      return (
        <span className="text-muted-foreground max-w-[200px] truncate text-sm">
          {campaignName || '-'}
        </span>
      );
    },
  },
  {
    accessorKey: 'created_time',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Oluşturulma" />
    ),
    cell: ({ row }) => {
      const createdTime = row.getValue('created_time') as string;
      const date = new Date(createdTime);
      return (
        <span className="text-muted-foreground text-sm">
          {format(date, 'dd MMM yyyy HH:mm', { locale: tr })}
        </span>
      );
    },
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
];
