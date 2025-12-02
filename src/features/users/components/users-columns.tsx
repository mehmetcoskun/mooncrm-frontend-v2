import { format } from 'date-fns';
import { type ColumnDef } from '@tanstack/react-table';
import { languages } from 'countries-list';
import { tr } from 'date-fns/locale';
import { Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { DataTableColumnHeader } from '@/components/data-table';
import { type User } from '../data/schema';
import { DataTableRowActions } from './data-table-row-actions';

export const usersColumns: ColumnDef<User>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => <div>{row.getValue('id')}</div>,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kullanıcı Adı" />
    ),
    cell: ({ row }) => <div>{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => <div>{row.getValue('email')}</div>,
  },
  {
    accessorKey: 'roles',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Roller" />
    ),
    cell: ({ row }) => {
      const roles = row.getValue('roles') as User['roles'];
      return (
        <div className="flex flex-wrap gap-1">
          {roles?.map((role) => (
            <Badge key={role.id} variant="secondary">
              {role.title}
            </Badge>
          ))}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'languages',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Diller" />
    ),
    cell: ({ row }) => {
      const userLanguages = row.getValue('languages') as string[];
      return (
        <div className="flex flex-wrap gap-1">
          {userLanguages?.map((langCode) => {
            const language = languages[langCode as keyof typeof languages];
            const languageName = language?.name || langCode.toUpperCase();
            return (
              <Badge key={langCode} variant="outline">
                {languageName}
              </Badge>
            );
          })}
        </div>
      );
    },
  },
  {
    accessorKey: 'is_active',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Aktif" />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue('is_active') as boolean;
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? 'Aktif' : 'Pasif'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'two_factor_enabled',
    header: ({ column }) => (
      <PermissionGuard roleId={1}>
        <DataTableColumnHeader column={column} title="2FA" />
      </PermissionGuard>
    ),
    cell: ({ row }) => {
      const twoFactorEnabled = row.getValue('two_factor_enabled') as boolean;
      return (
        <PermissionGuard roleId={1}>
          <div className="flex items-center gap-2">
            <Shield
              className={`h-4 w-4 ${twoFactorEnabled ? 'text-green-600' : 'text-muted-foreground'}`}
            />
            <Badge variant={twoFactorEnabled ? 'default' : 'secondary'}>
              {twoFactorEnabled ? 'Etkin' : 'Devre Dışı'}
            </Badge>
          </div>
        </PermissionGuard>
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
