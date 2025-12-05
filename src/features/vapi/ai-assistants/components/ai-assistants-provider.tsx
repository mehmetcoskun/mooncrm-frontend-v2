import React, { useState } from 'react';
import useDialogState from '@/hooks/use-dialog-state';
import { type AiAssistant } from '../data/schema';

type AiAssistantsDialogType = 'add' | 'edit' | 'delete';

type AiAssistantsContextType = {
  open: AiAssistantsDialogType | null;
  setOpen: (str: AiAssistantsDialogType | null) => void;
  currentRow: AiAssistant | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<AiAssistant | null>>;
};

const AiAssistantsContext = React.createContext<AiAssistantsContextType | null>(
  null
);

export function AiAssistantsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useDialogState<AiAssistantsDialogType>(null);
  const [currentRow, setCurrentRow] = useState<AiAssistant | null>(null);

  return (
    <AiAssistantsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </AiAssistantsContext>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAiAssistants = () => {
  const aiAssistantsContext = React.useContext(AiAssistantsContext);

  if (!aiAssistantsContext) {
    throw new Error(
      'useAiAssistants has to be used within <AiAssistantsContext>'
    );
  }

  return aiAssistantsContext;
};
