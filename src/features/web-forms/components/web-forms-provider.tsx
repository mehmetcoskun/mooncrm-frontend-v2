import React, { useState } from 'react';
import useDialogState from '@/hooks/use-dialog-state';
import { type WebForm } from '../data/schema';

type WebFormsDialogType = 'add' | 'edit' | 'delete';

type WebFormsContextType = {
  open: WebFormsDialogType | null;
  setOpen: (str: WebFormsDialogType | null) => void;
  currentRow: WebForm | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<WebForm | null>>;
};

const WebFormsContext = React.createContext<WebFormsContextType | null>(null);

export function WebFormsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<WebFormsDialogType>(null);
  const [currentRow, setCurrentRow] = useState<WebForm | null>(null);

  return (
    <WebFormsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </WebFormsContext>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useWebForms = () => {
  const webFormsContext = React.useContext(WebFormsContext);

  if (!webFormsContext) {
    throw new Error('useWebForms has to be used within <WebFormsContext>');
  }

  return webFormsContext;
};
