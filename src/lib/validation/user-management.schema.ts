import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email("A valid email address is required").max(255),
  displayName: z.string().min(1, "Display name is required").max(255),
  role: z.enum(["admin", "manager", "viewer"]).default("viewer"),
  sendInvitation: z.boolean().default(true),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserStatusSchema = z.object({
  status: z.enum(["active", "disabled"]),
});

export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
