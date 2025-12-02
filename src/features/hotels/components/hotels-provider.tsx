import React, { useState } from 'react';
import useDialogState from '@/hooks/use-dialog-state';
import { type Hotel } from '../data/schema';

type HotelsDialogType = 'add' | 'edit' | 'delete';

type HotelsContextType = {
  open: HotelsDialogType | null;
  setOpen: (str: HotelsDialogType | null) => void;
  currentRow: Hotel | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<Hotel | null>>;
};

const HotelsContext = React.createContext<HotelsContextType | null>(null);

export function HotelsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<HotelsDialogType>(null);
  const [currentRow, setCurrentRow] = useState<Hotel | null>(null);

  return (
    <HotelsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </HotelsContext>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useHotels = () => {
  const hotelsContext = React.useContext(HotelsContext);

  if (!hotelsContext) {
    throw new Error('useHotels has to be used within <HotelsContext>');
  }

  return hotelsContext;
};
