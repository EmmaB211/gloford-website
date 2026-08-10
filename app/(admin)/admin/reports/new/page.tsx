import { requireActorFromSession } from "@/lib/auth-context";
import { AdminReportEditor } from "@/components/admin/AdminReportEditor";

export const metadata = { title: "New Report", robots: { index: false, follow: false } };

export default async function NewReportPage() {
  await requireActorFromSession();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">New report</h1>
      </header>
      <AdminReportEditor
        initial={{
          title: "New report",
          slug: "",
          seoTitle: "New report",
          seoDesc: "Annual accountability and reporting page.",
        }}
      />
      
    </div>
  );
}
