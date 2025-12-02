import React, { useState } from 'react';
import useDialogState from '@/hooks/use-dialog-state';
import { type Status } from '../data/schema';

type StatusesDialogType = 'add' | 'edit' | 'delete';

type StatusesContextType = {
  open: StatusesDialogType | null;
  setOpen: (str: StatusesDialogType | null) => void;
  currentRow: Status | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<Status | null>>;
};

const StatusesContext = React.createContext<StatusesContextType | null>(null);

export function StatusesProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<StatusesDialogType>(null);
  const [currentRow, setCurrentRow] = useState<Status | null>(null);

  return (
    <StatusesContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </StatusesContext>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useStatuses = () => {
  const statusesContext = React.useContext(StatusesContext);

  if (!statusesContext) {
    throw new Error('useStatuses has to be used within <StatusesContext>');
  }

  return statusesContext;
};
