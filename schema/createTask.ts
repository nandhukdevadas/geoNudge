import { z } from "zod";

export const createTaskSchema = z.object({
  collectionId: z.number().nonnegative(),
  content: z.string().min(8, {
    message: "Task content must be at least 8 characters",
  }),
  expiresAt: z.date().optional(),
  location: z
    .object({
      latitude: z.number().min(-90).max(90).describe("Latitude of the location"),
      longitude: z.number().min(-180).max(180).describe("Longitude of the location"),
      radius: z.number().positive().describe("Radius in meters"),
    })
    .optional(),
});


export type createTaskSchemaType = z.infer<typeof createTaskSchema>