import { z } from 'zod';

const reportSchema = z.object({
  name: z.string(),
  contacts: z.object({
    total: z.number(),
    percentage: z.number(),
  }),
  offers: z.object({
    total: z.number(),
    percentage: z.number(),
  }),
  sales: z.object({
    total: z.number(),
    percentage: z.number(),
  }),
  canceled: z.object({
    total: z.number(),
    percentage: z.number(),
  }),
});
export type Report = z.infer<typeof reportSchema>;

export const reportListSchema = z.array(reportSchema);
