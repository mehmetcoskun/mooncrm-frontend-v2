import { useAppointments } from './appointments-provider';
import { AppointmentsViewDialog } from './appointments-view-dialog';

export function AppointmentsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useAppointments();

  return (
    <>
      {currentRow && (
        <AppointmentsViewDialog
          key={`appointment-view-${currentRow.id}`}
          open={open === 'view'}
          onOpenChange={() => {
            setOpen('view');
            setTimeout(() => {
              setCurrentRow(null);
            }, 500);
          }}
          currentRow={currentRow}
        />
      )}
    </>
  );
}
