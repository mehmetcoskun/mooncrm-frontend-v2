import { z } from 'zod';

export const whatsappTemplateSchema = z.object({
  id: z.number(),
  organization_id: z.number(),
  title: z.string(),
  language: z.string(),
  message: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});
export type WhatsappTemplate = z.infer<typeof whatsappTemplateSchema>;

export const whatsappTemplateListSchema = z.array(whatsappTemplateSchema);
