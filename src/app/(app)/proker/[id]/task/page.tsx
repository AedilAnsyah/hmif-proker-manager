import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import { TaskManager } from "./task-manager";

export const instant = false;
export const metadata = { title: "Task & Tracking Progres" };

export default async function ProkerTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const session = await requireAuth();
  const { id } = await params;
  const supabase = await createClient();

  // 1. Ambil Divisi
  const { data: divisions } = await supabase
    .from("divisions")
    .select("id, name")
    .eq("proker_id", id)
    .order("sort_order", { ascending: true });

  // 2. Ambil Roles user saat ini untuk memeriksa hak kelola task
  const { data: myRoles } = await supabase
    .from("proker_roles")
    .select("role, division_id")
    .eq("proker_id", id)
    .eq("user_id", session.id);

  const isProkerManager =
    session.globalRole === "admin" ||
    (myRoles ?? []).some((r) => ["sc", "pic", "ketupel"].includes(r.role));

  const managedDivisionIds = new Set<string>();
  if (isProkerManager) {
    (divisions ?? []).forEach((d) => managedDivisionIds.add(d.id));
  } else {
    (myRoles ?? []).forEach((r) => {
      if (["koor", "sekretaris", "bendahara"].includes(r.role) && r.division_id) {
        managedDivisionIds.add(r.division_id);
      }
    });
  }

  // 3. Ambil Tasks beserta relasi
  const { data: tasks } = await supabase
    .from("tasks")
    .select(`
      id,
      proker_id,
      division_id,
      jobdesk_id,
      title,
      description,
      status,
      deadline,
      divisions(id, name),
      task_assignees(user_id, profiles(id, full_name)),
      task_checklist_items(id, text, is_done),
      task_links(id, url, label)
    `)
    .eq("proker_id", id)
    .order("deadline", { ascending: true, nullsFirst: false });

  // Format Tasks & cek izin update status per task (Staff hanya jika ditugaskan atau seluruh divisi)
  const formattedTasks = (tasks ?? []).map((t) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const div = t.divisions as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const assigneesRaw = (t.task_assignees as any[]) ?? [];
    const assignees = assigneesRaw
      .map((a) => a.profiles)
      .filter(Boolean) as { id: string; full_name: string }[];

    const checklists = (t.task_checklist_items as { id: string; text: string; is_done: boolean }[]) ?? [];
    const links = (t.task_links as { id: string; url: string; label: string | null }[]) ?? [];

    const canManageThisDiv = managedDivisionIds.has(t.division_id);
    const inThisDiv = (myRoles ?? []).some((r) => r.division_id === t.division_id);
    const isAssignee = assignees.some((a) => a.id === session.id);
    const isWholeDiv = assignees.length === 0;

    const canUpdateStatus = canManageThisDiv || (inThisDiv && (isWholeDiv || isAssignee));

    return {
      id: t.id,
      proker_id: t.proker_id,
      division_id: t.division_id,
      division_name: div?.name ?? "—",
      title: t.title,
      description: t.description,
      status: t.status,
      deadline: t.deadline,
      jobdesk_id: t.jobdesk_id,
      assignees,
      checklists,
      checklist_total: checklists.length,
      checklist_done: checklists.filter((c) => c.is_done).length,
      links,
      links_count: links.length,
      can_update_status: canUpdateStatus,
    };
  });

  // 4. Ambil Anggota untuk Assignee dropdown
  const { data: memberRoles } = await supabase
    .from("proker_roles")
    .select("user_id, division_id, profiles(id, full_name)")
    .eq("proker_id", id);

  const memberMap = new Map<string, { id: string; full_name: string; division_id: string | null }>();
  for (const mr of memberRoles ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prof = mr.profiles as any;
    if (prof && !memberMap.has(prof.id)) {
      memberMap.set(prof.id, {
        id: prof.id,
        full_name: prof.full_name,
        division_id: mr.division_id,
      });
    }
  }

  // 5. Ambil Jobdesks untuk dropdown opsi jobdesk
  const { data: jobdesks } = await supabase
    .from("jobdesks")
    .select("id, division_id, title");

  return (
    <div>
      <TaskManager
        prokerId={id}
        divisions={divisions ?? []}
        tasks={formattedTasks}
        members={Array.from(memberMap.values())}
        jobdesks={jobdesks ?? []}
        canManageAny={managedDivisionIds.size > 0}
      />
    </div>
  );
}
