import { z } from 'zod';

export const whatsappSessionSchema = z.object({
  id: z.number(),
  organization_id: z.number(),
  title: z.string(),
  phone: z.string(),
  is_admin: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});
export type WhatsappSession = z.infer<typeof whatsappSessionSchema>;

export const whatsappSessionListSchema = z.array(whatsappSessionSchema);
