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

export const taskSchema = z.object({
  id: z.string().uuid().optional(),
  prokerId: z.string().uuid("Proker ID wajib ada"),
  divisionId: z.string().uuid("Divisi wajib dipilih"),
  jobdeskId: z.string().uuid().optional().nullable(),
  title: z.string().min(1, "Judul task wajib diisi").max(200),
  description: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  assigneeIds: z.array(z.string().uuid()).default([]),
});

export const taskChecklistItemSchema = z.object({
  id: z.string().uuid().optional(),
  taskId: z.string().uuid("Task ID wajib ada"),
  text: z.string().min(1, "Item checklist tidak boleh kosong").max(200),
  isDone: z.boolean().default(false),
});

export const taskLinkSchema = z.object({
  id: z.string().uuid().optional(),
  taskId: z.string().uuid("Task ID wajib ada"),
  checklistItemId: z.string().uuid().optional().nullable(),
  label: z.string().max(100).optional().nullable(),
  url: z.string().regex(/^https?:\/\//i, "URL harus diawali dengan http:// atau https://"),
});

export type DivisionInput = z.infer<typeof divisionSchema>;
export type MemberRoleInput = z.infer<typeof memberRoleSchema>;
export type CreateNonHmifUserInput = z.infer<typeof createNonHmifUserSchema>;
export type JobdeskInput = z.infer<typeof jobdeskSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type TaskChecklistItemInput = z.infer<typeof taskChecklistItemSchema>;
export type TaskLinkInput = z.infer<typeof taskLinkSchema>;

