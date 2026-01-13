import { FaTiktok } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface SettingsTiktokSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsTiktokSidebar({
  open,
  onOpenChange,
}: SettingsTiktokSidebarProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto p-4 sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FaTiktok className="h-5 w-5" />
            TikTok Ayarları
          </SheetTitle>
          <SheetDescription>
            TikTok hesabınızı bağlayın ve lead'lerinizi yönetin.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <div className="space-y-3">
            <p className="text-muted-foreground text-sm">
              TikTok hesabınızı bağlamak için aşağıdaki butona tıklayın.
            </p>
            <Button type="button" className="w-full">
              <FaTiktok className="mr-2 h-4 w-4" />
              TikTok ile Bağlan
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
