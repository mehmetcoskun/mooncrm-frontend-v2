import { z } from 'zod';

export const phoneNumberSchema = z.object({
  id: z.string(),
  orgId: z.string().optional(),
  name: z.string(),
  number: z.string(),
  provider: z.string().optional(),
  credentialId: z.string().optional(),
  numberE164CheckEnabled: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type PhoneNumber = z.infer<typeof phoneNumberSchema>;

export const phoneNumberListSchema = z.array(phoneNumberSchema);
