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
    accessorKey: 'has_status_filter',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Durum Filtresi" />
    ),
    cell: ({ row }) => {
      const hasStatusFilter = row.getValue('has_status_filter') as boolean;
      return (
        <Badge variant={hasStatusFilter ? 'default' : 'outline'}>
          {hasStatusFilter ? 'Var' : 'Yok'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'statuses',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Durumlar" />
    ),
    cell: ({ row }) => {
      const role = row.original;
      const hasStatusFilter = row.getValue('has_status_filter') as boolean;

      if (!hasStatusFilter) {
        return <span className="text-muted-foreground text-sm">Tümü</span>;
      }

      if (!role.statuses || role.statuses.length === 0) {
        return <span className="text-muted-foreground text-sm">Hiçbiri</span>;
      }

      return (
        <div className="flex flex-wrap gap-1">
          {role.statuses.slice(0, 3).map((status) => (
            <span
              key={status.id}
              className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
              style={{
                backgroundColor: status.background_color + '20',
                color: status.background_color,
              }}
            >
              {status.title}
            </span>
          ))}
          {role.statuses.length > 3 && (
            <span className="text-muted-foreground flex items-center text-xs">
              +{role.statuses.length - 3} daha
            </span>
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
