"use client";

import { useState, useEffect } from "react";
import { RichTextDisplay } from "./RichTextDisplay";

type ReadMoreProps = {
  html: string;
  limit?: number; // character count to consider "long"
  className?: string;
};

export default function ReadMore({ html, limit = 220, className }: ReadMoreProps) {
  const [expanded, setExpanded] = useState(false);
  const [isLong, setIsLong] = useState(false);

  useEffect(() => {
    try {
      const el = document.createElement("div");
      el.innerHTML = html || "";
      const text = el.textContent || el.innerText || "";
      setIsLong(text.trim().length > limit);
    } catch (e) {
      setIsLong(false);
    }
  }, [html, limit]);

  const [text, setText] = useState("");

  useEffect(() => {
    try {
      const el = document.createElement("div");
      el.innerHTML = html || "";
      const t = el.textContent || el.innerText || "";
      setText(t.trim());
    } catch (e) {
      setText("");
    }
  }, [html]);

  const preview = text.length > limit ? text.slice(0, limit).replace(/\s+\S*$/, "") + "..." : text;

  return (
    <div>
      {!expanded ? (
        <div className={className}>{preview}</div>
      ) : (
        <RichTextDisplay className={className} html={html} />
      )}

      {isLong && (
        <div className="mt-2 flex items-center">
          {!expanded ? (
            <button
              type="button"
              className="text-sm font-semibold text-[var(--color-primary)]"
              onClick={() => setExpanded(true)}
            >
              Read more
            </button>
          ) : (
            <button
              type="button"
              className="text-sm font-semibold text-[var(--color-primary)]"
              onClick={() => setExpanded(false)}
            >
              Show less
            </button>
          )}
        </div>
      )}
    </div>
  );
}
