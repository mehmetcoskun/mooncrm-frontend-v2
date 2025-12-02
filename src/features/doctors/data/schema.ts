import { z } from 'zod';

export const doctorSchema = z.object({
  id: z.number(),
  organization_id: z.number(),
  name: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});
export type Doctor = z.infer<typeof doctorSchema>;

export const doctorListSchema = z.array(doctorSchema);
