import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useOrganizationStore } from '@/stores/organization-store';

export function useOrganizationEffect() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganizationStore();

  useEffect(() => {
    if (currentOrganization) {
      queryClient.invalidateQueries();
    }
  }, [currentOrganization?.id, queryClient]);
}
