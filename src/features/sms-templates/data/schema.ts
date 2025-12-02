import { z } from 'zod';

export const smsTemplateSchema = z.object({
  id: z.number(),
  organization_id: z.number(),
  title: z.string(),
  language: z.string(),
  message: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});
export type SmsTemplate = z.infer<typeof smsTemplateSchema>;

export const smsTemplateListSchema = z.array(smsTemplateSchema);
