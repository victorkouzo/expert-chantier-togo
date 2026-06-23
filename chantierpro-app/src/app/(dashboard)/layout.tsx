import { Sidebar } from "@/components/sidebar";
import { requireSession } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  return (
    <div className="flex h-screen bg-black">
      <Sidebar role={session.role} fullName={session.fullName} companyName={session.companyName} />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
