import { format } from 'date-fns';
import { type ColumnDef } from '@tanstack/react-table';
import { languages } from 'countries-list';
import { tr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/data-table';
import { type EmailTemplate } from '../data/schema';
import { DataTableRowActions } from './data-table-row-actions';

export const emailTemplatesColumns: ColumnDef<EmailTemplate>[] = [
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
      <DataTableColumnHeader column={column} title="E-Posta Şablon Adı" />
    ),
    cell: ({ row }) => <div>{row.getValue('title')}</div>,
  },
  {
    accessorKey: 'language',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Dil" />
    ),
    cell: ({ row }) => {
      const language = row.getValue('language') as string;
      const languageName = languages[language as keyof typeof languages];
      return <Badge variant="outline">{languageName?.name}</Badge>;
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
