import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeShiki from "@shikijs/rehype";
import { buildMdxComponents } from "./mdx/components";

/**
 * Renders `articles.content_mdx` with `next-mdx-remote/rsc` (TECHNICAL-REQUIREMENTS.md §7.2).
 * Custom components come from the vetted allowlist; fenced code is syntax-highlighted at build
 * time by shiki (zero runtime JS). No `dangerouslySetInnerHTML` anywhere (§9.3).
 *
 * Inline-code styling lives on the wrapper via `:not(pre)>code` so it never collides with
 * shiki's fenced `<pre><code>` output.
 */
export function ArticleBody({ mdx }: { mdx: string }) {
  return (
    <div className="mx-auto max-w-article [&_:not(pre)>code]:rounded [&_:not(pre)>code]:bg-surface-light [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[0.88em] [&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-border [&_pre]:p-5 [&_pre]:text-[0.85rem]">
      <MDXRemote
        source={mdx}
        components={buildMdxComponents(mdx)}
        options={{
          mdxOptions: {
            // High-contrast light theme so syntax tokens clear the WCAG AA contrast gate (§1).
            rehypePlugins: [[rehypeShiki, { theme: "github-light-high-contrast" }]],
          },
        }}
      />
    </div>
  );
}
