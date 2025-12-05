import { z } from 'zod';

export const aiAssistantSchema = z.object({
  id: z.string(),
  orgId: z.string().optional(),
  name: z.string(),
  model: z
    .object({
      provider: z.string().optional(),
      model: z.string().optional(),
      messages: z.array(z.any()).optional(),
    })
    .optional(),
  voice: z
    .object({
      provider: z.string().optional(),
      voiceId: z.string().optional(),
    })
    .optional(),
  firstMessage: z.string().optional(),
  firstMessageMode: z.string().optional(),
  voicemailMessage: z.string().optional(),
  endCallMessage: z.string().optional(),
  transcriber: z
    .object({
      provider: z.string().optional(),
      model: z.string().optional(),
      language: z.string().optional(),
    })
    .optional(),
  serverMessages: z.array(z.string()).optional(),
  analysisPlan: z.any().optional(),
  server: z
    .object({
      url: z.string().optional(),
      timeoutSeconds: z.number().optional(),
    })
    .optional(),
  backgroundDenoisingEnabled: z.boolean().optional(),
  backgroundSound: z.string().optional(),
  stopSpeakingPlan: z
    .object({
      numWords: z.number().optional(),
      voiceSeconds: z.number().optional(),
      backoffSeconds: z.number().optional(),
    })
    .optional(),
  endCallFunctionEnabled: z.boolean().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type AiAssistant = z.infer<typeof aiAssistantSchema>;

export const aiAssistantListSchema = z.array(aiAssistantSchema);
