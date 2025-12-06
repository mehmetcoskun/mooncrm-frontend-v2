import { CalendarDayDialog } from './calendar-day-dialog';
import { useCalendar } from './calendar-provider';

export function CalendarDialogs() {
  const { open, setOpen, selectedDate, selectedAppointments } = useCalendar();

  return (
    <CalendarDayDialog
      date={selectedDate}
      appointments={selectedAppointments}
      open={open === 'day-detail'}
      onOpenChange={(isOpen) => setOpen(isOpen ? 'day-detail' : null)}
    />
  );
}
