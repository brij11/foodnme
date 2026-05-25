/**
 * TEMPORARY raw-markdown fallback (blog-02). Renders the article body as paragraphs with
 * `##`/`###` headings only — enough to read while story-blog-03 lands the real
 * `next-mdx-remote/rsc` renderer (custom components + shiki), which replaces this module.
 *
 * No `dangerouslySetInnerHTML` — text is rendered as React children (TECHNICAL-REQUIREMENTS §9.3).
 */
export function ArticleBody({ mdx }: { mdx: string }) {
  const blocks = mdx.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className="mx-auto max-w-article">
      {blocks.map((block, i) => {
        if (block.startsWith("### ")) {
          return (
            <h3 key={i} className="mt-8 mb-3 font-heading text-[1.1rem] font-bold text-text">
              {block.slice(4)}
            </h3>
          );
        }
        if (block.startsWith("## ")) {
          return (
            <h2 key={i} className="mt-12 mb-4 font-heading text-[1.4rem] font-bold tracking-[-0.02em] text-text">
              {block.slice(3)}
            </h2>
          );
        }
        return (
          <p key={i} className="mb-5 font-body text-[0.95rem] leading-[1.7] text-text">
            {block}
          </p>
        );
      })}
    </div>
  );
}
