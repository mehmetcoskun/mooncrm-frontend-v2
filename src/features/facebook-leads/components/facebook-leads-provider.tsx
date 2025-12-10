import React, { useState } from 'react';
import useDialogState from '@/hooks/use-dialog-state';
import { type FacebookLead } from '../data/schema';

type FacebookLeadsDialogType = 'view';

type FacebookLeadsContextType = {
  open: FacebookLeadsDialogType | null;
  setOpen: (str: FacebookLeadsDialogType | null) => void;
  currentRow: FacebookLead | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<FacebookLead | null>>;
};

const FacebookLeadsContext = React.createContext<FacebookLeadsContextType | null>(null);

export function FacebookLeadsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<FacebookLeadsDialogType>(null);
  const [currentRow, setCurrentRow] = useState<FacebookLead | null>(null);

  return (
    <FacebookLeadsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </FacebookLeadsContext>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useFacebookLeads = () => {
  const facebookLeadsContext = React.useContext(FacebookLeadsContext);

  if (!facebookLeadsContext) {
    throw new Error('useFacebookLeads has to be used within <FacebookLeadsContext>');
  }

  return facebookLeadsContext;
};
