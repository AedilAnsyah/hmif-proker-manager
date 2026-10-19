import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Username wajib diisi")
    .transform((v) => v.trim().toLowerCase().replace(/\s+/g, " ")),
  password: z.string().min(1, "Password wajib diisi"),
});

export const changePasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password minimal 8 karakter"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export const createUserSchema = z.object({
  fullName: z.string().min(1, "Nama lengkap wajib diisi").max(100),
  nim: z
    .string()
    .min(1, "NIM wajib diisi")
    .regex(/^\d+$/, "NIM hanya boleh berisi angka"),
  angkatan: z.coerce
    .number()
    .int()
    .min(2000, "Angkatan tidak valid")
    .max(2100, "Angkatan tidak valid"),
  globalRole: z.enum(["admin", "bph", "member", "external"]).default("member"),
});

export const createPeriodSchema = z.object({
  name: z.string().min(1, "Nama periode wajib diisi").max(50),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
});

export const createProkerSchema = z.object({
  name: z.string().min(1, "Nama proker wajib diisi").max(200),
  periodId: z.string().uuid("Periode wajib dipilih"),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  picId: z.string().uuid("PIC wajib dipilih"),
  ketupelId: z.string().uuid("Ketua Pelaksana wajib dipilih"),
  scIds: z.array(z.string().uuid()).default([]),
});

export const updateProkerSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Nama proker wajib diisi").max(200),
  periodId: z.string().uuid("Periode wajib dipilih"),
  description: z.string().optional(),
  status: z.enum(["planning", "active", "done"]).default("planning"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  picId: z.string().uuid("PIC wajib dipilih"),
  ketupelId: z.string().uuid("Ketua Pelaksana wajib dipilih"),
  scIds: z.array(z.string().uuid()).default([]),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreatePeriodInput = z.infer<typeof createPeriodSchema>;
export type CreateProkerInput = z.infer<typeof createProkerSchema>;
export type UpdateProkerInput = z.infer<typeof updateProkerSchema>;

