import { z } from 'zod';

const statisticSchema = z.object({
  id: z.number(),
  type: z.string(),
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
  children: z.array(z.any()),
});
export type Statistic = z.infer<typeof statisticSchema>;

export const statisticListSchema = z.array(statisticSchema);
