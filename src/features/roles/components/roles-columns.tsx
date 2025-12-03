import { format } from 'date-fns';
import { type ColumnDef } from '@tanstack/react-table';
import { tr } from 'date-fns/locale';
import { Globe, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/data-table';
import { type Role } from '../data/schema';
import { DataTableRowActions } from './data-table-row-actions';

export const rolesColumns: ColumnDef<Role>[] = [
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
      <DataTableColumnHeader column={column} title="Rol Adı" />
    ),
    cell: ({ row }) => <div>{row.getValue('title')}</div>,
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
