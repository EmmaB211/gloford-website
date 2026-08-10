export function resolvePageCreateRedirectPath({
  pageId,
  redirectTo,
}: {
  pageId: string;
  redirectTo?: string | null;
}) {
  if (redirectTo) return redirectTo;
  return `/admin/pages/${pageId}`;
}
