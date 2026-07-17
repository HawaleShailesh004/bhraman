import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getSessionAdmin } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getSessionAdmin();
  if (!admin) redirect("/");

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-ink text-paper">
        <div className="page-shell flex items-center justify-between gap-3 py-4">
          <Link
            href="/admin/disputes"
            className="flex min-w-0 items-center gap-2"
          >
            <ShieldCheck size={20} className="shrink-0 text-amber" />
            <span className="truncate font-display font-extrabold">
              Bhraman Admin
            </span>
          </Link>
          <span className="max-w-[45%] truncate text-xs text-[#9DB0A4]">
            {admin.email}
          </span>
        </div>
      </header>
      <main className="page-shell py-6 sm:py-8">{children}</main>
    </div>
  );
}
