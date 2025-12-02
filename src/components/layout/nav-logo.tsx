import { useEffect, useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Binary, ChevronsUpDown, Plus } from 'lucide-react';
import { useOrganizationStore } from '@/stores/organization-store';
import { useAuth } from '@/hooks/use-auth';
import { usePermissions } from '@/hooks/use-permissions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import type { Organization } from '@/features/organizations/data/schema';

export function NavLogo() {
  const { isMobile } = useSidebar();
  const [searchQuery, setSearchQuery] = useState('');
  const { isSuperUser } = usePermissions();
  const { user } = useAuth();
  const {
    organizations,
    currentOrganization,
    isLoading,
    fetchOrganizations,
    setCurrentOrganization,
    getCurrentOrganizationFromUser,
  } = useOrganizationStore();

  const isSuperUserValue = useMemo(() => isSuperUser(), [isSuperUser]);

  useEffect(() => {
    // User bilgisi ile current organization'ı al
    if (user && !currentOrganization) {
      getCurrentOrganizationFromUser(user);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, currentOrganization]);

  const filteredOrganizations = organizations.filter((organization) =>
    organization.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectOrganization = (organization: Organization) => {
    setCurrentOrganization(organization);
  };

  const handleDropdownOpenChange = (isOpen: boolean) => {
    if (isOpen && isSuperUserValue && organizations.length === 0) {
      fetchOrganizations();
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {isSuperUserValue ? (
          <DropdownMenu onOpenChange={handleDropdownOpenChange}>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Binary className="size-6" />
                </div>
                <div className="grid flex-1 text-start text-sm leading-tight">
                  <span className="truncate font-semibold">MoonCRM</span>
                  <span className="truncate text-xs">
                    {currentOrganization?.name || 'Firma seçiniz'}
                  </span>
                </div>
                <ChevronsUpDown className="ms-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-100 rounded-lg"
              align="start"
              side={isMobile ? 'bottom' : 'right'}
              sideOffset={4}
            >
              <div className="p-2">
                <div className="mb-2 flex items-center gap-2">
                  <Input
                    placeholder="Firma ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8"
                  />
                </div>
                <div className="max-h-[200px] overflow-y-auto">
                  {isLoading ? (
                    <div className="text-muted-foreground px-2 py-2 text-center text-sm">
                      Yükleniyor...
                    </div>
                  ) : (
                    <>
                      {filteredOrganizations.map((organization) => (
                        <DropdownMenuItem
                          key={organization.id}
                          className="p-2"
                          onSelect={() =>
                            handleSelectOrganization(organization)
                          }
                        >
                          {organization.code} - {organization.name}
                        </DropdownMenuItem>
                      ))}
                      {filteredOrganizations.length === 0 && (
                        <div className="text-muted-foreground px-2 py-2 text-center text-sm">
                          Sonuç bulunamadı
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="gap-2 p-2">
                <Link to="/organizations" className="flex items-center">
                  <div className="bg-background flex size-6 items-center justify-center rounded-md border">
                    <Plus className="size-4" />
                  </div>
                  <div className="text-muted-foreground font-medium">
                    Firma Ekle
                  </div>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <SidebarMenuButton size="lg">
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <Binary className="size-6" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">MoonCRM</span>
              <span className="truncate text-xs">
                {currentOrganization?.name || 'Yükleniyor...'}
              </span>
            </div>
          </SidebarMenuButton>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
