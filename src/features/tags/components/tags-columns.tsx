import { format } from 'date-fns';
import { type ColumnDef } from '@tanstack/react-table';
import { languages } from 'countries-list';
import { tr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/data-table';
import { type Category } from '@/features/categories/data/schema';
import { type User } from '@/features/users/data/schema';
import { type Tag } from '../data/schema';
import { DataTableRowActions } from './data-table-row-actions';

export const tagsColumns: ColumnDef<Tag>[] = [
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
      <DataTableColumnHeader column={column} title="Etiket Adı" />
    ),
    cell: ({ row }) => <div>{row.getValue('title')}</div>,
  },
  {
    accessorKey: 'categories',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kategoriler" />
    ),
    cell: ({ row }) => {
      const categories = row.getValue('categories') as Category[];
      const maxDisplay = 3;
      const displayCategories = categories.slice(0, maxDisplay);
      const remaining = categories.length - maxDisplay;

      return (
        <div className="flex flex-wrap gap-1">
          {displayCategories.map((category) => (
            <Badge key={category.id} variant="default">
              {category.title}
            </Badge>
          ))}
          {remaining > 0 && <Badge variant="outline">+{remaining}</Badge>}
        </div>
      );
    },
  },
  {
    accessorKey: 'users',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kullanıcılar" />
    ),
    cell: ({ row }) => {
      const users = row.getValue('users') as User[];
      const maxDisplay = 3;
      const displayUsers = users.slice(0, maxDisplay);
      const remaining = users.length - maxDisplay;

      return (
        <div className="flex flex-wrap gap-1">
          {displayUsers.map((user) => (
            <Badge key={user.id} variant="default">
              {user.name}
            </Badge>
          ))}
          {remaining > 0 && <Badge variant="outline">+{remaining}</Badge>}
        </div>
      );
    },
  },
  {
    accessorKey: 'language',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Dil" />
    ),
    cell: ({ row }) => {
      const language = row.getValue('language') as string;
      const languageName = languages[language as keyof typeof languages];
      return <Badge variant="default">{languageName?.name}</Badge>;
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
