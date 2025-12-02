import { type ReactNode, useEffect } from 'react';
import { Building } from 'lucide-react';
import { useOrganizationStore } from '@/stores/organization-store';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

interface OrganizationGuardProps {
  children: ReactNode;
}

export function OrganizationGuard({ children }: OrganizationGuardProps) {
  const {
    currentOrganization,
    isLoading: orgLoading,
    getCurrentOrganizationFromUser,
  } = useOrganizationStore();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !currentOrganization) {
      getCurrentOrganizationFromUser(user);
    }
  }, [authLoading, user, currentOrganization, getCurrentOrganizationFromUser]);

  if (authLoading || orgLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="mb-2 flex items-center justify-between space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>

        <div className="space-y-4">
          <div className="w-full overflow-x-auto pb-2">
            <div className="flex space-x-2">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-16" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card rounded-lg border p-6">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-7 w-20" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
            <div className="bg-card col-span-1 rounded-lg border lg:col-span-4">
              <div className="p-6 pb-2">
                <Skeleton className="h-6 w-20" />
              </div>
              <div className="p-6 pt-0">
                <Skeleton className="h-[350px] w-full" />
              </div>
            </div>

            <div className="bg-card col-span-1 rounded-lg border lg:col-span-3">
              <div className="p-6 pb-2">
                <Skeleton className="mb-2 h-6 w-24" />
                <Skeleton className="h-4 w-40" />
              </div>
              <div className="space-y-4 p-6 pt-0">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentOrganization) {
    return <>{children}</>;
  }

  return (
    <div className="bg-background absolute inset-0 flex flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <div className="mb-12 flex justify-center">
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-black shadow-lg">
            <Building className="h-14 w-14 text-white" />
          </div>
        </div>

        <div className="space-y-10 text-center">
          <div>
            <h2 className="text-foreground mb-6 text-3xl font-bold tracking-tight">
              Firma Seçimi Gerekli
            </h2>

            <p className="text-muted-foreground text-lg leading-relaxed">
              Bu sayfadaki içeriği görüntüleyebilmek için lütfen bir firma
              seçin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
