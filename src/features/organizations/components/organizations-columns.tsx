import { format } from 'date-fns';
import { type ColumnDef } from '@tanstack/react-table';
import { tr } from 'date-fns/locale';
import { DataTableColumnHeader } from '@/components/data-table';
import { type Organization } from '../data/schema';
import { DataTableRowActions } from './data-table-row-actions';

export const organizationsColumns: ColumnDef<Organization>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => <div>{row.getValue('id')}</div>,
  },
  {
    accessorKey: 'logo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Logo" />
    ),
    cell: ({ row }) => {
      const logo = row.getValue('logo') as string | null;
      return (
        <div className="flex items-center">
          {logo ? (
            <img
              src={`${import.meta.env.VITE_STORAGE_URL}/${logo}`}
              alt="Organization logo"
              className="h-8 w-8 rounded border object-contain"
            />
          ) : (
            <div className="bg-muted flex h-8 w-8 items-center justify-center rounded border">
              <span className="text-muted-foreground text-xs">-</span>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Firma Adı" />
    ),
    cell: ({ row }) => <div>{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Firma Kodu" />
    ),
    cell: ({ row }) => <div>{row.getValue('code')}</div>,
    enableSorting: false,
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
