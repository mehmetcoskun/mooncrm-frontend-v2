import { z } from 'zod';

export const segmentSchema = z.object({
  id: z.number(),
  organization_id: z.number(),
  title: z.string(),
  language: z.string(),
  filters: z
    .object({
      conditions: z.array(
        z.object({
          field: z.string(),
          operator: z.string(),
          value: z.any(),
        })
      ),
      logicalOperator: z.string(),
    })
    .optional(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});
export type Segment = z.infer<typeof segmentSchema>;

export const segmentListSchema = z.array(segmentSchema);
