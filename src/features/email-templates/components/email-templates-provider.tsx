import React, { useState } from 'react';
import useDialogState from '@/hooks/use-dialog-state';
import { type EmailTemplate } from '../data/schema';

type EmailTemplatesDialogType = 'add' | 'edit' | 'delete';

type EmailTemplatesContextType = {
  open: EmailTemplatesDialogType | null;
  setOpen: (str: EmailTemplatesDialogType | null) => void;
  currentRow: EmailTemplate | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<EmailTemplate | null>>;
};

const EmailTemplatesContext =
  React.createContext<EmailTemplatesContextType | null>(null);

export function EmailTemplatesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useDialogState<EmailTemplatesDialogType>(null);
  const [currentRow, setCurrentRow] = useState<EmailTemplate | null>(null);

  return (
    <EmailTemplatesContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </EmailTemplatesContext>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useEmailTemplates = () => {
  const emailTemplatesContext = React.useContext(EmailTemplatesContext);

  if (!emailTemplatesContext) {
    throw new Error(
      'useEmailTemplates has to be used within <EmailTemplatesContext>'
    );
  }

  return emailTemplatesContext;
};
