import { z } from 'zod';
import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { withPermissionRequired } from '@/components/auth/with-permission-required';
import { Customers } from '@/features/customers';

const filterConditionSchema = z.object({
  id: z.string(),
  field: z.string(),
  operator: z.string(),
  value: z.union([z.array(z.string()), z.string(), z.boolean()]).optional(),
});

const customersSearchSchema = z.object({
  search: z.string().optional().catch(''),
  page: z.number().optional().catch(0),
  pageSize: z.number().optional().catch(10),
  filters: z.array(filterConditionSchema).optional().catch([]),
  filterObject: z.record(z.string(), z.unknown()).optional().catch({}),
  operator: z.enum(['and', 'or']).optional().catch('and'),
});

export type CustomersSearch = z.infer<typeof customersSearchSchema>;

const CustomersWithAuth = withPermissionRequired(
  withOrganizationRequired(Customers),
  { permission: 'customer_Access' }
);

export const Route = createFileRoute('/_authenticated/customers/')({
  component: CustomersWithAuth,
  validateSearch: customersSearchSchema,
});
