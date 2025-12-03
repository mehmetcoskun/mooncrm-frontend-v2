import React, { useState } from 'react';
import useDialogState from '@/hooks/use-dialog-state';
import { type WhatsappSession } from '../data/schema';

type WhatsappSessionsDialogType = 'add' | 'delete' | 'qr';

type WhatsappSessionsContextType = {
  open: WhatsappSessionsDialogType | null;
  setOpen: (str: WhatsappSessionsDialogType | null) => void;
  currentRow: WhatsappSession | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<WhatsappSession | null>>;
};

const WhatsappSessionsContext =
  React.createContext<WhatsappSessionsContextType | null>(null);

export function WhatsappSessionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useDialogState<WhatsappSessionsDialogType>(null);
  const [currentRow, setCurrentRow] = useState<WhatsappSession | null>(null);

  return (
    <WhatsappSessionsContext
      value={{ open, setOpen, currentRow, setCurrentRow }}
    >
      {children}
    </WhatsappSessionsContext>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useWhatsappSessions = () => {
  const whatsappSessionsContext = React.useContext(WhatsappSessionsContext);

  if (!whatsappSessionsContext) {
    throw new Error(
      'useWhatsappSessions has to be used within <WhatsappSessionsContext>'
    );
  }

  return whatsappSessionsContext;
};
