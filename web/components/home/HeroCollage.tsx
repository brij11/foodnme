import Image from "next/image";

export type HeroCollageProps = {
  /** Cover URLs (Supabase Storage in prod, seed Unsplash in dev — §4.3/§7.5). Decorative. */
  covers: string[];
};

/**
 * Hero "magazine collage" (story-homepage-05 #5): two cover photos in offset frames,
 * a sample article-preview frame, and a stat frame. Entirely decorative, so the whole
 * thing is `aria-hidden`. Photo sources come from real article data (never hardcoded
 * external URLs) and render through `next/image`. Hidden below `lg` to keep the mobile
 * hero typographic and fast.
 */
export function HeroCollage({ covers }: HeroCollageProps) {
  const [a, b] = covers;
  return (
    <div aria-hidden="true" className="relative hidden min-h-[420px] lg:block">
      {a && (
        <div className="absolute right-6 top-0 h-56 w-44 overflow-hidden rounded-lg border border-border shadow-elevated rotate-[-3deg]">
          <Image src={a} alt="" fill sizes="176px" className="object-cover" />
        </div>
      )}
      {b && (
        <div className="absolute left-2 top-28 h-48 w-40 overflow-hidden rounded-lg border border-border shadow-card rotate-[2deg]">
          <Image src={b} alt="" fill sizes="160px" className="object-cover" />
        </div>
      )}

      <div className="absolute right-0 top-48 w-60 rounded-lg border border-border bg-card-bg p-4 shadow-elevated rotate-[1.5deg]">
        <span className="inline-block rounded-sm bg-tag-green-bg px-2 py-1 font-heading text-[0.6rem] font-bold text-tag-green-text">
          HACCP
        </span>
        <p className="mt-2 font-heading text-[0.85rem] font-semibold leading-snug text-text">
          HACCP Plan Template — Dairy Processing
        </p>
        <div className="mt-3 flex justify-between font-body text-[0.65rem] text-muted">
          <span>28 pages</span>
          <span>1,840 downloads</span>
        </div>
      </div>

      <div className="absolute bottom-2 left-10 rounded-lg border border-border bg-card-bg px-5 py-4 shadow-card">
        <div className="font-display text-2xl font-bold leading-none tracking-tight text-primary">4.2k</div>
        <div className="mt-1 font-body text-[0.6rem] font-medium uppercase tracking-[0.08em] text-muted">
          Subscribers
        </div>
      </div>
    </div>
  );
}
