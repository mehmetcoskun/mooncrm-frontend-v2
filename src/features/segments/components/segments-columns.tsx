import { type ColumnDef } from '@tanstack/react-table';
import { languages } from 'countries-list';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/data-table';
import { type Segment } from '../data/schema';
import { DataTableRowActions } from './data-table-row-actions';
import { SegmentsCommunicationButtons } from './segments-communication-buttons';

export const segmentsColumns: ColumnDef<Segment>[] = [
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
      <DataTableColumnHeader column={column} title="Segment Adı" />
    ),
    cell: ({ row }) => <div>{row.getValue('title')}</div>,
  },
  {
    accessorKey: 'customer_count',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Müşteri Sayısı" />
    ),
    cell: ({ row }) => <div>{row.getValue('customer_count')}</div>,
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
    id: 'communication',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="İletişim" />
    ),
    cell: ({ row }) => {
      const segment = row.original;
      return <SegmentsCommunicationButtons segment={segment} />;
    },
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
];
