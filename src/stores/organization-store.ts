import {
  getOrganization,
  getOrganizations,
} from '@/services/organization-service';
import { create } from 'zustand';
import type { Organization } from '@/features/organizations/data/schema';
import type { User } from '@/features/users/data/schema';

interface OrganizationState {
  currentOrganization: Organization | null;
  organizations: Organization[];
  isLoading: boolean;
  error: string | null;
  fetchOrganizations: () => Promise<void>;
  setCurrentOrganization: (organization: Organization) => void;
  getCurrentOrganizationFromUser: (user: User | null) => Promise<void>;
}

export const useOrganizationStore = create<OrganizationState>((set) => ({
  currentOrganization: null,
  organizations: [],
  isLoading: false,
  error: null,

  fetchOrganizations: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await getOrganizations();
      set({ organizations: data, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Firmalar alınamadı',
        isLoading: false,
      });
    }
  },

  setCurrentOrganization: (organization: Organization) => {
    set({ currentOrganization: organization });
    localStorage.setItem('organization_id', String(organization.id));
  },

  getCurrentOrganizationFromUser: async (user: User | null) => {
    let organizationId: number | null = null;

    if (user?.organization_id) {
      organizationId = user.organization_id;
    } else {
      const storedOrgId = localStorage.getItem('organization_id');
      if (storedOrgId) {
        organizationId = Number(storedOrgId);
      }
    }

    if (!organizationId) return;

    try {
      set({ isLoading: true, error: null });
      const orgData = await getOrganization(organizationId);
      set({ currentOrganization: orgData, isLoading: false });
      localStorage.setItem('organization_id', String(organizationId));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Firma bilgisi alınamadı',
        isLoading: false,
      });
    }
  },
}));
