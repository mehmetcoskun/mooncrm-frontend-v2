import React, { useState } from 'react';
import useDialogState from '@/hooks/use-dialog-state';
import { type Appointment } from '../data/schema';

type AppointmentsDialogType = 'view';

type AppointmentsContextType = {
  open: AppointmentsDialogType | null;
  setOpen: (str: AppointmentsDialogType | null) => void;
  currentRow: Appointment | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<Appointment | null>>;
};

const AppointmentsContext = React.createContext<AppointmentsContextType | null>(
  null
);

export function AppointmentsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useDialogState<AppointmentsDialogType>(null);
  const [currentRow, setCurrentRow] = useState<Appointment | null>(null);

  return (
    <AppointmentsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </AppointmentsContext>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAppointments = () => {
  const appointmentsContext = React.useContext(AppointmentsContext);

  if (!appointmentsContext) {
    throw new Error(
      'useAppointments has to be used within <AppointmentsContext>'
    );
  }

  return appointmentsContext;
};
