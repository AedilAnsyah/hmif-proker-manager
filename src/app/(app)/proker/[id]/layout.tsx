import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { ProkerHeader } from "./proker-header";

export const instant = false;

export default async function ProkerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const session = await requireAuth();
  const { id } = await params;
  const supabase = await createClient();

  // Ambil detail proker & periode
  const { data: proker } = await supabase
    .from("prokers")
    .select("id, name, description, status, start_date, end_date, periods(id, name)")
    .eq("id", id)
    .single();

  if (!proker) {
    notFound();
  }

  // Verifikasi hak akses: Admin & BPH bisa lihat semua, lainnya harus terdaftar di proker_roles
  const isViewAll = session.globalRole === "admin" || session.globalRole === "bph";

  const { data: myRoles } = await supabase
    .from("proker_roles")
    .select("role, division_id, label")
    .eq("proker_id", id)
    .eq("user_id", session.id);

  if (!isViewAll && (!myRoles || myRoles.length === 0)) {
    redirect("/");
  }

  const isManager =
    session.globalRole === "admin" ||
    (myRoles ?? []).some((r) => ["sc", "pic", "ketupel"].includes(r.role));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const period = proker.periods as any;

  return (
    <div>
      <ProkerHeader
        prokerId={proker.id}
        name={proker.name}
        status={proker.status}
        periodName={period?.name ?? ""}
        startDate={proker.start_date}
        endDate={proker.end_date}
        isManager={isManager}
        myRoles={(myRoles ?? []).map((r) => r.role)}
      />
      <div className="mt-6">{children}</div>
    </div>
  );
}
