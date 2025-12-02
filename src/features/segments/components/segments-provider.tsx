import React, { useState } from 'react';
import useDialogState from '@/hooks/use-dialog-state';
import { type Segment } from '../data/schema';

type SegmentsDialogType = 'add' | 'edit' | 'delete' | 'whatsapp' | 'mail' | 'sms' | 'phone';

type SegmentsContextType = {
  open: SegmentsDialogType | null;
  setOpen: (str: SegmentsDialogType | null) => void;
  currentRow: Segment | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<Segment | null>>;
};

const SegmentsContext = React.createContext<SegmentsContextType | null>(null);

export function SegmentsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<SegmentsDialogType>(null);
  const [currentRow, setCurrentRow] = useState<Segment | null>(null);

  return (
    <SegmentsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </SegmentsContext>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSegments = () => {
  const segmentsContext = React.useContext(SegmentsContext);

  if (!segmentsContext) {
    throw new Error('useSegments has to be used within <SegmentsContext>');
  }

  return segmentsContext;
};
