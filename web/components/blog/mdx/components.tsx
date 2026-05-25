import type { ComponentProps, ReactNode } from "react";
import { Tag, type TagVariant } from "@/components/ui/Tag";
import { PullQuote } from "./PullQuote";
import { CTABox } from "./CTABox";
import { MdxImage } from "./MdxImage";

// Typography rules (UI-DESIGN-HANDOFF.md §1.3): H2/H3 Inter 700, body IBM Plex Sans.
// Inline code styling is applied on the wrapper (see ArticleBody) so it never collides with
// shiki's fenced-block output.
const typography = {
  h2: (p: ComponentProps<"h2">) => (
    <h2 className="mt-12 mb-4 font-heading text-[1.4rem] font-bold tracking-[-0.02em] text-text" {...p} />
  ),
  h3: (p: ComponentProps<"h3">) => (
    <h3 className="mt-8 mb-3 font-heading text-[1.1rem] font-bold text-text" {...p} />
  ),
  p: (p: ComponentProps<"p">) => <p className="mb-5 font-body text-[0.95rem] leading-[1.7] text-text" {...p} />,
  ul: (p: ComponentProps<"ul">) => (
    <ul className="mb-6 list-disc pl-6 font-body text-[0.95rem] leading-[1.7] text-text" {...p} />
  ),
  ol: (p: ComponentProps<"ol">) => (
    <ol className="mb-6 list-decimal pl-6 font-body text-[0.95rem] leading-[1.7] text-text" {...p} />
  ),
  li: (p: ComponentProps<"li">) => <li className="mb-2" {...p} />,
  a: (p: ComponentProps<"a">) => <a className="text-primary underline underline-offset-2 hover:text-primary-deep" {...p} />,
  blockquote: (p: ComponentProps<"blockquote">) => (
    <blockquote className="my-8 rounded-r-md border-l-4 border-primary bg-surface-light px-6 py-5 font-display text-[1.15rem] text-text" {...p} />
  ),
};

// The author-facing allowlist (TECHNICAL-REQUIREMENTS.md §7.2): the only custom components
// MDX authors may use.
const ALLOWED = {
  PullQuote,
  CTABox,
  Image: MdxImage,
  Tag: (p: { variant?: TagVariant; children: ReactNode }) => <Tag variant={p.variant ?? "green"}>{p.children}</Tag>,
};

const KNOWN_COMPONENT_NAMES = new Set(Object.keys(ALLOWED));

function makeFallback(name: string) {
  function MdxUnknown(props: { children?: ReactNode }) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(`[mdx] <${name}> is not in the component allowlist — rendered as a plain <div>.`);
    }
    return <div>{props.children}</div>;
  }
  return MdxUnknown;
}

/**
 * Builds the components map for a given MDX source. Pre-scans the source for `<Capitalized>`
 * usages; any not in the allowlist gets a logging `<div>` fallback (AC#6) — so unknown
 * components degrade gracefully instead of throwing, and the allowlist is the only escape
 * hatch (no `dangerouslySetInnerHTML` anywhere, §9.3).
 */
export function buildMdxComponents(source: string) {
  const used = new Set<string>();
  for (const match of source.matchAll(/<([A-Z][A-Za-z0-9]*)/g)) {
    if (match[1]) used.add(match[1]);
  }
  const fallbacks: Record<string, ReturnType<typeof makeFallback>> = {};
  for (const name of used) {
    if (!KNOWN_COMPONENT_NAMES.has(name)) fallbacks[name] = makeFallback(name);
  }
  return { ...typography, ...ALLOWED, ...fallbacks };
}
