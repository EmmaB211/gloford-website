"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireActorFromSession } from "@/lib/auth-context";
import {
  createPage,
  updatePage,
  setPageStatus,
  deletePage,
} from "@/lib/services/pages";
import { resolvePageCreateRedirectPath } from "@/lib/pages/redirects";

export async function createPageAction(raw: unknown, options?: { redirectTo?: string | null }) {
  const actor = await requireActorFromSession();
  const page = await createPage(actor, raw);
  const status = (raw as { status?: "PUBLISHED" | "ARCHIVED" } | null | undefined)?.status;
  if (status && page.status !== status) {
    await setPageStatus(actor, { id: page.id, status });
  }
  revalidatePath("/admin/pages");
  revalidatePath("/partners");
  redirect(resolvePageCreateRedirectPath({ pageId: page.id, redirectTo: options?.redirectTo }));
}

export async function updatePageAction(raw: unknown) {
  const actor = await requireActorFromSession();
  const row = await updatePage(actor, raw);
  const status = (raw as { status?: "PUBLISHED" | "ARCHIVED" } | null | undefined)?.status;
  if (status && row.status !== status) {
    await setPageStatus(actor, { id: row.id, status });
  }
  revalidatePath("/admin/pages");
  revalidatePath("/partners");
  revalidatePath(`/admin/pages/${row.id}`);
}

export async function setPageStatusAction(raw: unknown) {
  const actor = await requireActorFromSession();
  const row = await setPageStatus(actor, raw);
  revalidatePath("/admin/pages");
  revalidatePath("/partners");
  revalidatePath(`/admin/pages/${row.id}`);
}

export async function deletePageAction(raw: unknown) {
  const actor = await requireActorFromSession();
  await deletePage(actor, raw);
  revalidatePath("/admin/pages");
  redirect("/admin/pages");
}
