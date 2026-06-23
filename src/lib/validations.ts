import { z } from "zod";

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Profile Schema
export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
});

// Diwaniya Schemas
export const diwaniyaSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  location: z.string().optional(),
  description: z.string().optional(),
  max_capacity: z.number().int().min(1, "Capacity must be at least 1").default(50),
});

export const updateDiwaniyaSchema = diwaniyaSchema.partial();

// Registration Schemas
export const registrationSchema = z.object({
  diwaniya_id: z.string().uuid("Invalid diwaniya ID"),
  notes: z.string().optional(),
});

export const updateRegistrationStatusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
  admin_notes: z.string().optional(),
});

// Ban Schemas
export const banSchema = z.object({
  diwaniya_id: z.string().uuid("Invalid diwaniya ID"),
  user_id: z.string().uuid("Invalid user ID"),
  reason: z.string().min(1, "Reason is required"),
  is_permanent: z.boolean().default(false),
  expires_at: z.string().datetime().optional(),
});

// User Management Schemas
export const updateUserRoleSchema = z.object({
  role: z.enum(["guest", "admin", "super_admin"]),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type DiwaniyaInput = z.infer<typeof diwaniyaSchema>;
export type UpdateDiwaniyaInput = z.infer<typeof updateDiwaniyaSchema>;
export type RegistrationInput = z.infer<typeof registrationSchema>;
export type UpdateRegistrationStatusInput = z.infer<typeof updateRegistrationStatusSchema>;
export type BanInput = z.infer<typeof banSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
