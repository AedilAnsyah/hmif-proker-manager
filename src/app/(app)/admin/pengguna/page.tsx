import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import Link from "next/link";
import { UserManagementTable } from "./user-table";

export const metadata = { title: "Kelola Pengguna" };
export const instant = false;

export default async function AdminPenggunaPage() {
  await connection();
  await requireRole("admin");

  const supabase = await createClient();
  const { data: users } = await supabase
    .from("profiles")
    .select("id, username, full_name, global_role, angkatan, is_active, must_change_password, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink lg:text-[26px]">Kelola Pengguna</h1>
          <p className="mt-1 text-sm text-ink-2">
            {users?.length ?? 0} akun terdaftar
          </p>
        </div>
        <Link
          href="/admin/pengguna/baru"
          className="inline-flex items-center h-10 px-4 bg-accent text-on-accent font-semibold text-sm rounded-md hover:bg-accent-hover transition-colors"
        >
          Buat akun
        </Link>
      </div>

      <UserManagementTable users={users ?? []} />
    </div>
  );
}
