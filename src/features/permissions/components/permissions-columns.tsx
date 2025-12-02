import { format } from 'date-fns';
import { type ColumnDef } from '@tanstack/react-table';
import { tr } from 'date-fns/locale';
import { Globe, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/data-table';
import { type Permission } from '../data/schema';
import { DataTableRowActions } from './data-table-row-actions';

export const permissionsColumns: ColumnDef<Permission>[] = [
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
      <DataTableColumnHeader column={column} title="İzin Adı" />
    ),
    cell: ({ row }) => <div>{row.getValue('title')}</div>,
  },
  {
    accessorKey: 'slug',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Slug" />
    ),
    cell: ({ row }) => <div>{row.getValue('slug')}</div>,
    enableSorting: false,
  },
  {
    accessorKey: 'is_global',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Global" />
    ),
    cell: ({ row }) => {
      const isGlobal = row.getValue('is_global') as boolean;
      return (
        <div className="flex items-center">
          {isGlobal ? (
            <Badge variant="default" className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              Global
            </Badge>
          ) : (
            <Badge variant="outline" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Lokal
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'is_custom',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Özel" />
    ),
    cell: ({ row }) => {
      const isCustom = row.getValue('is_custom') as boolean;
      return (
        <div>
          {isCustom ? (
            <Badge variant="secondary">Özel</Badge>
          ) : (
            <Badge variant="outline">Sistem</Badge>
          )}
        </div>
      );
    },
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
