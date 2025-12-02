import { useAuth } from '@/hooks/use-auth';
import { ConfirmDialog } from '@/components/confirm-dialog';

interface SignOutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const { logout } = useAuth();

  const handleSignOut = () => {
    logout();
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Çıkış Yap"
      desc="Çıkış yapmak istediğinizden emin misiniz? Hesabınıza erişmek için tekrar giriş yapmanız gerekecektir."
      confirmText="Çıkış Yap"
      cancelBtnText="İptal"
      handleConfirm={handleSignOut}
      className="sm:max-w-sm"
    />
  );
}
