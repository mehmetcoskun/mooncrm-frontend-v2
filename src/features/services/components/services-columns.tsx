import { format } from 'date-fns';
import { type ColumnDef } from '@tanstack/react-table';
import { tr } from 'date-fns/locale';
import { DataTableColumnHeader } from '@/components/data-table';
import { type Service } from '../data/schema';
import { DataTableRowActions } from './data-table-row-actions';

export const servicesColumns: ColumnDef<Service>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => <div>{row.getValue('id')}</div>,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Hizmet Adı" />
    ),
    cell: ({ row }) => <div>{row.getValue('title')}</div>,
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Oluşturulma Tarihi" />
    ),
    cell: ({ row }) => {
      return (
        <div>
          {format(row.getValue('created_at'), 'dd MMMM yyyy HH:mm:ss', {
            locale: tr,
          })}
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
];
