import React, { useState } from 'react';
import useDialogState from '@/hooks/use-dialog-state';
import { type Transfer } from '../data/schema';

type TransfersDialogType = 'add' | 'edit' | 'delete';

type TransfersContextType = {
  open: TransfersDialogType | null;
  setOpen: (str: TransfersDialogType | null) => void;
  currentRow: Transfer | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<Transfer | null>>;
};

const TransfersContext = React.createContext<TransfersContextType | null>(null);

export function TransfersProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<TransfersDialogType>(null);
  const [currentRow, setCurrentRow] = useState<Transfer | null>(null);

  return (
    <TransfersContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </TransfersContext>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTransfers = () => {
  const transfersContext = React.useContext(TransfersContext);

  if (!transfersContext) {
    throw new Error('useTransfers has to be used within <TransfersContext>');
  }

  return transfersContext;
};
