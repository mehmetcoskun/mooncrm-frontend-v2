import { type ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/data-table';
import { type PhoneNumber } from '../data/schema';
import { DataTableRowActions } from './data-table-row-actions';

export const phoneNumbersColumns: ColumnDef<PhoneNumber>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Telefon Numarası Adı" />
    ),
    cell: ({ row }) => <div>{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'number',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Telefon Numarası" />
    ),
    cell: ({ row }) => <div>{row.getValue('number')}</div>,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
];
