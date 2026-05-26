import { Icon } from "@/components/ui/Icon";
import { SPECIALIZATIONS } from "@/lib/experts";

/**
 * Experts directory filter rail (story-experts-01). A plain GET form (no client JS) so the
 * page stays SSR-with-searchParams: free-text `q`, specialization multi-select, location ILIKE,
 * and an "Available now" toggle. The prototype's "Verified only" toggle + rating sort are
 * dropped (no rating column, §4.2). Current selections re-hydrate from props.
 */
export function ExpertsFilterSidebar({
  q = "",
  specializations = [],
  location = "",
  available = false,
}: {
  q?: string;
  specializations?: string[];
  location?: string;
  available?: boolean;
}) {
  const sectionHead =
    "mb-3 border-b border-border pb-2.5 font-heading text-[0.7rem] font-bold uppercase tracking-[0.12em] text-muted";

  return (
    <form action="/experts" method="get" className="space-y-7">
      <div>
        <h2 className={sectionHead}>Search</h2>
        <div className="relative">
          <Icon
            name="search"
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-2"
          />
          <input
            type="search"
            name="q"
            defaultValue={q}
            aria-label="Search experts by name, expertise, or role"
            placeholder="Name, expertise, role…"
            className="w-full rounded-md border-[1.5px] border-border bg-white py-2.5 pl-10 pr-3 font-body text-[0.86rem] text-text focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <div>
        <h2 className={sectionHead}>Quick filters</h2>
        <label className="flex items-center gap-2.5 font-body text-[0.86rem] text-text">
          <input type="checkbox" name="available" value="true" defaultChecked={available} />
          Available now
        </label>
      </div>

      <div>
        <h2 className={sectionHead}>Location</h2>
        <input
          type="text"
          name="location"
          defaultValue={location}
          aria-label="Filter by location"
          placeholder="City or state…"
          className="w-full rounded-md border-[1.5px] border-border bg-white px-3 py-2.5 font-body text-[0.86rem] text-text focus:border-primary focus:outline-none"
        />
      </div>

      <div>
        <h2 className={sectionHead}>Specialization</h2>
        <div className="max-h-[260px] space-y-1.5 overflow-y-auto pr-1.5">
          {SPECIALIZATIONS.map((s) => (
            <label key={s} className="flex items-center gap-2.5 font-body text-[0.86rem] text-text">
              <input
                type="checkbox"
                name="specialization"
                value={s}
                defaultChecked={specializations.includes(s)}
              />
              {s}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <button
          type="submit"
          className="w-full rounded-md bg-primary px-4 py-2.5 font-heading text-[0.82rem] font-bold text-white transition hover:bg-primary-deep"
        >
          Apply filters
        </button>
        <a
          href="/experts"
          className="block text-center font-body text-[0.8rem] text-primary hover:underline"
        >
          Clear all filters
        </a>
      </div>
    </form>
  );
}
