import React, { useState } from 'react';
import useDialogState from '@/hooks/use-dialog-state';
import { type CalendarAppointment } from '../data/schema';

type CalendarDialogType = 'day-detail';

type CalendarContextType = {
  open: CalendarDialogType | null;
  setOpen: (str: CalendarDialogType | null) => void;
  selectedDate: Date | null;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date | null>>;
  selectedAppointments: CalendarAppointment[];
  setSelectedAppointments: React.Dispatch<
    React.SetStateAction<CalendarAppointment[]>
  >;
};

const CalendarContext = React.createContext<CalendarContextType | null>(null);

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<CalendarDialogType>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedAppointments, setSelectedAppointments] = useState<
    CalendarAppointment[]
  >([]);

  return (
    <CalendarContext
      value={{
        open,
        setOpen,
        selectedDate,
        setSelectedDate,
        selectedAppointments,
        setSelectedAppointments,
      }}
    >
      {children}
    </CalendarContext>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCalendar = () => {
  const calendarContext = React.useContext(CalendarContext);

  if (!calendarContext) {
    throw new Error('useCalendar has to be used within <CalendarContext>');
  }

  return calendarContext;
};
