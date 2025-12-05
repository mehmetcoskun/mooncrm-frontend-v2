import { type ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/data-table';
import { type AiAssistant } from '../data/schema';
import { DataTableRowActions } from './data-table-row-actions';

export const aiAssistantsColumns: ColumnDef<AiAssistant>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Asistan Adı" />
    ),
    cell: ({ row }) => <div>{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'model',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Model" />
    ),
    cell: ({ row }) => {
      const assistant = row.original;
      return (
        <Badge variant="secondary">
          {assistant.model?.provider || ''} - {assistant.model?.model || ''}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'voice',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ses" />
    ),
    cell: ({ row }) => {
      const assistant = row.original;
      return (
        <Badge variant="outline">
          {assistant.voice?.provider || ''} - {assistant.voice?.voiceId || ''}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
];
