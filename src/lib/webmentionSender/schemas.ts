import { z } from "zod"

const timestamp = z
  .string()
  .refine((value) => Number.isFinite(Date.parse(value)))
export const deliveryRecordSchema = z.object({
  version: z.string(),
  acceptedVersion: z.string().optional(),
  operation: z.enum(["present", "removed"]),
  attempts: z.number().int().nonnegative(),
  status: z.enum(["accepted", "no-endpoint", "failed"]),
  endpoint: z.string().optional(),
  lastAttempt: timestamp,
  retryAt: timestamp.optional(),
  error: z.string().optional(),
})
export const senderStateSchema = z.object({
  version: z.literal(1),
  sources: z.record(
    z.string(),
    z.object({ targets: z.record(z.string(), deliveryRecordSchema) })
  ),
})
export const postIndexSchema = z.array(
  z
    .object({
      id: z.number().int().positive(),
      permalink: z.string(),
    })
    .refine((post) => post.permalink === `/post/${post.id}`)
)
