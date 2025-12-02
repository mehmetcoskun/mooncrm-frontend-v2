import { z } from 'zod';

export const organizationSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string(),
  logo: z.string().nullable().optional(),
  trial_ends_at: z.coerce.date().nullable().optional(),
  license_ends_at: z.coerce.date().nullable().optional(),
  is_active: z.boolean().optional(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});
export type Organization = z.infer<typeof organizationSchema>;

export const organizationListSchema = z.array(organizationSchema);
