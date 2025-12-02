import React, { useState } from 'react';
import useDialogState from '@/hooks/use-dialog-state';
import { type SmsTemplate } from '../data/schema';

type SmsTemplatesDialogType = 'add' | 'edit' | 'delete';

type SmsTemplatesContextType = {
  open: SmsTemplatesDialogType | null;
  setOpen: (str: SmsTemplatesDialogType | null) => void;
  currentRow: SmsTemplate | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<SmsTemplate | null>>;
};

const SmsTemplatesContext = React.createContext<SmsTemplatesContextType | null>(
  null
);

export function SmsTemplatesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useDialogState<SmsTemplatesDialogType>(null);
  const [currentRow, setCurrentRow] = useState<SmsTemplate | null>(null);

  return (
    <SmsTemplatesContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </SmsTemplatesContext>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSmsTemplates = () => {
  const smsTemplatesContext = React.useContext(SmsTemplatesContext);

  if (!smsTemplatesContext) {
    throw new Error(
      'useSmsTemplates has to be used within <SmsTemplatesContext>'
    );
  }

  return smsTemplatesContext;
};
