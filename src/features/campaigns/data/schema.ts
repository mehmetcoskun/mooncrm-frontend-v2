import { z } from 'zod';

export const campaignStatusSchema = z.object({
  status: z.enum(['in-progress', 'completed', 'stopped']),
  totalCustomers: z.number(),
  sentCustomers: z.number(),
  remainingCustomers: z.number(),
  remainingTime: z.number().optional(),
});
export type CampaignStatus = z.infer<typeof campaignStatusSchema>;

export const storedCampaignSchema = z.object({
  key: z.string(),
  createdAt: z.string(),
  totalCustomers: z.number(),
});
export type StoredCampaign = z.infer<typeof storedCampaignSchema>;
