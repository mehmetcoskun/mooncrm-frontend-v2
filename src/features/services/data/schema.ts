import { z } from 'zod';

export const serviceSchema = z.object({
  id: z.number(),
  organization_id: z.number(),
  title: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});
export type Service = z.infer<typeof serviceSchema>;

export const serviceListSchema = z.array(serviceSchema);
