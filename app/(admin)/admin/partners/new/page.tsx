import { requireActorFromSession } from "@/lib/auth-context";
import { PageForm } from "@/app/(admin)/admin/pages/PageForm";
import { slugify } from "@/lib/pages/slug";

export const metadata = { title: "New Partner", robots: { index: false, follow: false } };

export default async function NewPartnerPage() {
  await requireActorFromSession();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">New partner</h1>
      </header>
      <PageForm
        showPartnerStatus
        initial={{
          title: "New partner",
          slug: slugify("New partner"),
          seoTitle: "New partner",
          seoDesc: "Partnership overview and collaboration details.",
          redirectTo: "/admin/partners",
        }}
      />
    </div>
  );
}
