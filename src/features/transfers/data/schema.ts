import { z } from 'zod';

const messageTemplatesSchema = z.object({
  sale: z.string(),
  cancel: z.string(),
}).nullable();

export const transferSchema = z.object({
  id: z.number(),
  organization_id: z.number(),
  name: z.string(),
  email: z.string().nullable(),
  chat_id: z.string().nullable(),
  message_templates: messageTemplatesSchema,
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});
export type Transfer = z.infer<typeof transferSchema>;

export const transferListSchema = z.array(transferSchema);
