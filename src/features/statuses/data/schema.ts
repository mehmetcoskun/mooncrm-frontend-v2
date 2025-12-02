import { z } from 'zod';

export const statusSchema = z.object({
  id: z.number(),
  organization_id: z.number(),
  title: z.string(),
  background_color: z.string(),
  is_global: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});
export type Status = z.infer<typeof statusSchema>;

export const statusListSchema = z.array(statusSchema);
