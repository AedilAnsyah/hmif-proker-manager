import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import { TugasSayaList } from "./tugas-saya-list";

export const instant = false;
export const metadata = { title: "Tugas Saya" };

export default async function TugasPage() {
  await connection();
  const session = await requireAuth();
  const supabase = await createClient();

  // Ambil proker_roles user saat ini untuk identifikasi proker dan divisi yang diikuti
  const { data: myRoles } = await supabase
    .from("proker_roles")
    .select("proker_id, division_id, role")
    .eq("user_id", session.id);

  const myDivisions = (myRoles ?? []).map((r) => r.division_id).filter(Boolean) as string[];
  const isManagerInProker = (prokerId: string) =>
    (myRoles ?? []).some(
      (r) => r.proker_id === prokerId && ["sc", "pic", "ketupel"].includes(r.role)
    );

  // Ambil semua task yang relevan untuk user (baik ditugaskan langsung ke user, atau ditugaskan ke seluruh divisinya)
  const { data: tasks } = await supabase
    .from("tasks")
    .select(`
      id,
      proker_id,
      division_id,
      title,
      description,
      status,
      deadline,
      prokers(name),
      divisions(name),
      task_assignees(user_id, profiles(id, full_name)),
      task_checklist_items(id, text, is_done),
      task_links(id, url, label)
    `)
    .order("deadline", { ascending: true, nullsFirst: false });

  // Filter hanya task yang menjadi tanggung jawab user:
  // 1. Ditugaskan langsung ke user (ada di task_assignees), ATAU
  // 2. Ditugaskan ke divisinya tanpa assignee spesifik (task_assignees kosong)
  const myTasks = (tasks ?? []).filter((t) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const assigneesRaw = (t.task_assignees as any[]) ?? [];
    const isDirectAssignee = assigneesRaw.some((a) => a.user_id === session.id);
    const isDivisionWide = assigneesRaw.length === 0 && myDivisions.includes(t.division_id);
    const isManager = isManagerInProker(t.proker_id);

    return isDirectAssignee || isDivisionWide || isManager;
  });

  const formattedTasks = myTasks.map((t) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const proker = t.prokers as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const div = t.divisions as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const assigneesRaw = (t.task_assignees as any[]) ?? [];
    const assignees = assigneesRaw
      .map((a) => a.profiles)
      .filter(Boolean) as { id: string; full_name: string }[];

    const checklists = (t.task_checklist_items as { id: string; text: string; is_done: boolean }[]) ?? [];
    const links = (t.task_links as { id: string; url: string; label: string | null }[]) ?? [];

    return {
      id: t.id,
      proker_id: t.proker_id,
      proker_name: proker?.name ?? "Proker",
      division_id: t.division_id,
      division_name: div?.name ?? "Divisi",
      title: t.title,
      description: t.description,
      status: t.status,
      deadline: t.deadline,
      assignees,
      checklists,
      checklist_total: checklists.length,
      checklist_done: checklists.filter((c) => c.is_done).length,
      links,
      links_count: links.length,
      can_update_status: true,
    };
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink lg:text-[26px]">Tugas Saya</h1>
      <p className="mt-1 text-sm text-ink-2 mb-6">
        Semua tugas Anda di seluruh kepanitiaan proker, diurutkan berdasarkan batas waktu.
      </p>

      <TugasSayaList tasks={formattedTasks} />
    </div>
  );
}
