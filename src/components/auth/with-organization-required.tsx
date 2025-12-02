import type { ReactNode, ComponentType } from 'react';
import { OrganizationGuard } from './organization-guard';

export function withOrganizationRequired<P extends object>(
  Component: ComponentType<P>
) {
  return function OrganizationRequiredComponent(props: P): ReactNode {
    return (
      <OrganizationGuard>
        <Component {...props} />
      </OrganizationGuard>
    );
  };
}
