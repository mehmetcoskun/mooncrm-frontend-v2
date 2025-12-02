import { z } from 'zod';

export const emailTemplateSchema = z.object({
  id: z.number(),
  organization_id: z.number(),
  title: z.string(),
  language: z.string(),
  subject: z.string(),
  template: z.string().nullable(),
  html: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});
export type EmailTemplate = z.infer<typeof emailTemplateSchema>;

export const emailTemplateListSchema = z.array(emailTemplateSchema);
