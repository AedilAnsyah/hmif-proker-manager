import Link from "next/link";

export default async function ProkerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink lg:text-[26px]">
        Detail Proker
      </h1>
      <p className="mt-1 text-sm text-ink-2">ID: {id}</p>
      <div className="mt-6 border border-line rounded-lg p-8 text-center">
        <h3 className="text-base font-semibold text-ink">
          Halaman ini sedang dikembangkan
        </h3>
        <p className="mt-1 text-sm text-ink-2">
          Detail proker akan tersedia di Fase 2.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex items-center h-10 px-4 bg-accent text-on-accent font-semibold text-sm rounded-md hover:bg-accent-hover transition-colors"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
