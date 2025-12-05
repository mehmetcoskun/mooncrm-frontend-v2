import React, { useState } from 'react';
import useDialogState from '@/hooks/use-dialog-state';
import { type PhoneNumber } from '../data/schema';

type PhoneNumbersDialogType = 'add' | 'edit' | 'delete' | 'call';

type PhoneNumbersContextType = {
  open: PhoneNumbersDialogType | null;
  setOpen: (str: PhoneNumbersDialogType | null) => void;
  currentRow: PhoneNumber | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<PhoneNumber | null>>;
};

const PhoneNumbersContext = React.createContext<PhoneNumbersContextType | null>(
  null
);

export function PhoneNumbersProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useDialogState<PhoneNumbersDialogType>(null);
  const [currentRow, setCurrentRow] = useState<PhoneNumber | null>(null);

  return (
    <PhoneNumbersContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </PhoneNumbersContext>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const usePhoneNumbers = () => {
  const phoneNumbersContext = React.useContext(PhoneNumbersContext);

  if (!phoneNumbersContext) {
    throw new Error(
      'usePhoneNumbers has to be used within <PhoneNumbersContext>'
    );
  }

  return phoneNumbersContext;
};
