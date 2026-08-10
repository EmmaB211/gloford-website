/**
 * Server-side HTML sanitization for richText blocks.
 *
 * Runs inside the richText service before persistence. We never trust
 * client-submitted HTML — admins can paste anything into the rich-text
 * editor and we must strip script/iframe/on* before it touches the DB.
 *
 * Using a hand-rolled allowlist to avoid pulling in DOMPurify + jsdom
 * at this scale; sufficient for block content which is prose-focused.
 */

const ALLOWED_TAGS = new Set([
  "p", "br", "strong", "em", "u", "s", "a", "ul", "ol", "li",
  "h2", "h3", "h4", "blockquote", "code", "pre", "hr", "object",
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "target", "rel"]),
  object: new Set(["data", "type", "width", "height"]),
};

const URL_SAFE = /^(https?:|mailto:|tel:|\/)/i;

export function sanitizeHtml(input: string): string {
  if (!input) return "";

  // Strip entire layout sections that should never come from rich text blocks.
  // This removes copied page headers/footers/navs and keeps only the actual
  // content body text that we want to render in page descriptions.
  let out = input.replace(
    /<(?:header|nav|footer|aside|main|article)\b[^>]*>[\s\S]*?<\/(?:header|nav|footer|aside|main|article)>/gi,
    "",
  );

  const dangerousTagPattern = /<\/?(script|style|iframe|embed|form|input|base|meta|link)[^>]*>/gi;
  out = out.replace(dangerousTagPattern, "");

  out = out.replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*')/gi, "");
  out = out.replace(/javascript:/gi, "");
  out = out.replace(/data:/gi, "");

  out = out.replace(/<\/?([a-z][a-z0-9]*)\b([^>]*)>/gi, (match, tag: string, attrs: string) => {
    const lower = tag.toLowerCase();
    if (!ALLOWED_TAGS.has(lower)) return "";
    if (match.startsWith("</")) return `</${lower}>`;

    const allowed = ALLOWED_ATTRS[lower];
    if (!allowed) return `<${lower}>`;

    const cleaned: string[] = [];
    const attrRegex = /([a-z-]+)\s*=\s*("([^"]*)"|'([^']*)')/gi;
    let attrMatch: RegExpExecArray | null;
    while ((attrMatch = attrRegex.exec(attrs))) {
      const name = attrMatch[1];
      const value = attrMatch[3] ?? attrMatch[4] ?? "";
      if (!name || value === undefined) continue;
      if (!allowed.has(name.toLowerCase())) continue;
      if (name.toLowerCase() === "href" && !URL_SAFE.test(value)) continue;
      cleaned.push(`${name}="${escapeAttr(value)}"`);
    }

    if (lower === "a") {
      const hasRel = cleaned.some((attr) => attr.toLowerCase().startsWith("rel="));
      if (!hasRel) cleaned.push('rel="noopener noreferrer"');
    }

    if (lower === "object") {
      const dataAttr = cleaned.find((attr) => attr.toLowerCase().startsWith("data="));
      const dataValue = dataAttr?.split("=")[1]?.replace(/^"|"$/g, "");
      if (dataValue && !URL_SAFE.test(dataValue)) {
        const filtered = cleaned.filter((attr) => !attr.toLowerCase().startsWith("data="));
        return filtered.length ? `<${lower} ${filtered.join(" ")}>` : `<${lower}>`;
      }
    }

    return cleaned.length ? `<${lower} ${cleaned.join(" ")}>` : `<${lower}>`;
  });

  return out;
}

function escapeAttr(v: string): string {
  return v.replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
