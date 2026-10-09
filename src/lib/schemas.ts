import { z } from "zod";
import { roles } from "./permissions";

export const loginSchema = z.object({ email: z.email().max(254).transform((v) => v.trim().toLowerCase()) });
export const invitationSchema = z.object({
  email: z.email().max(254).transform((v) => v.trim().toLowerCase()),
  role: z.enum(roles),
}).strict();
export const memberRoleSchema = z.object({ role: z.enum(roles) }).strict();
export const contentSchema = z.object({
  title: z.string().trim().min(3, "Escreva um título com pelo menos 3 caracteres.").max(180),
  platform: z.enum(["linkedin", "instagram"]),
  body: z.string().max(12000),
  planned_for: z.iso.datetime({ offset: true }).nullable(),
}).strict();
export const uuidSchema = z.uuid();
export type ContentInput = z.infer<typeof contentSchema>;
