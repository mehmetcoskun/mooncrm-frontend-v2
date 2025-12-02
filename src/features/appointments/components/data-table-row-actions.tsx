import { type Row } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type Appointment } from '../data/schema';
import { useAppointments } from './appointments-provider';

type DataTableRowActionsProps = {
  row: Row<Appointment>;
};

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useAppointments();

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setCurrentRow(row.original);
          setOpen('view');
        }}
      >
        <Eye className="h-4 w-4" />
      </Button>
    </div>
  );
}
