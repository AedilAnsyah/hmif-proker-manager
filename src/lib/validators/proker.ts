import { z } from "zod";

export const divisionSchema = z.object({
  id: z.string().uuid().optional(),
  prokerId: z.string().uuid("Proker ID wajib ada"),
  name: z.string().min(1, "Nama divisi wajib diisi").max(100),
  description: z.string().optional(),
  sortOrder: z.coerce.number().int().default(0),
});

export const memberRoleSchema = z.object({
  prokerId: z.string().uuid("Proker ID wajib ada"),
  userId: z.string().uuid("Pengguna wajib dipilih"),
  role: z.enum(["sc", "pic", "ketupel", "sekretaris", "bendahara", "koor", "staff"]),
  divisionId: z.string().uuid().optional().nullable(),
  label: z.string().max(50).optional().nullable(),
});

export const createNonHmifUserSchema = z.object({
  prokerId: z.string().uuid("Proker ID wajib ada"),
  fullName: z.string().min(1, "Nama lengkap wajib diisi").max(100),
  nim: z.string().min(1, "NIM/Identitas wajib diisi").regex(/^\d+$/, "Hanya boleh angka"),
  angkatan: z.coerce.number().int().min(2000).max(2100),
  role: z.enum(["sc", "pic", "ketupel", "sekretaris", "bendahara", "koor", "staff"]),
  divisionId: z.string().uuid().optional().nullable(),
  label: z.string().max(50).optional().nullable(),
});

export const jobdeskSchema = z.object({
  id: z.string().uuid().optional(),
  divisionId: z.string().uuid("Divisi wajib dipilih"),
  title: z.string().min(1, "Judul jobdesk wajib diisi").max(200),
  description: z.string().optional().nullable(),
  sortOrder: z.coerce.number().int().default(0),
});

export type DivisionInput = z.infer<typeof divisionSchema>;
export type MemberRoleInput = z.infer<typeof memberRoleSchema>;
export type CreateNonHmifUserInput = z.infer<typeof createNonHmifUserSchema>;
export type JobdeskInput = z.infer<typeof jobdeskSchema>;
