import React, { useState } from 'react';
import useDialogState from '@/hooks/use-dialog-state';
import { type WhatsappTemplate } from '../data/schema';

type WhatsappTemplatesDialogType = 'add' | 'edit' | 'delete';

type WhatsappTemplatesContextType = {
  open: WhatsappTemplatesDialogType | null;
  setOpen: (str: WhatsappTemplatesDialogType | null) => void;
  currentRow: WhatsappTemplate | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<WhatsappTemplate | null>>;
};

const WhatsappTemplatesContext =
  React.createContext<WhatsappTemplatesContextType | null>(null);

export function WhatsappTemplatesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useDialogState<WhatsappTemplatesDialogType>(null);
  const [currentRow, setCurrentRow] = useState<WhatsappTemplate | null>(null);

  return (
    <WhatsappTemplatesContext
      value={{ open, setOpen, currentRow, setCurrentRow }}
    >
      {children}
    </WhatsappTemplatesContext>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useWhatsappTemplates = () => {
  const whatsappTemplatesContext = React.useContext(WhatsappTemplatesContext);

  if (!whatsappTemplatesContext) {
    throw new Error(
      'useWhatsappTemplates has to be used within <WhatsappTemplatesContext>'
    );
  }

  return whatsappTemplatesContext;
};
