import { Icon } from "@/components/ui/Icon";
import { JOB_TYPES, EXPERIENCE_LEVELS } from "@/lib/jobs";

/** Jobs filter rail (story-jobs-01) — a plain GET form (SSR). No remote toggle (no schema column). */
export function JobsFilterSidebar({
  q = "",
  jobTypes = [],
  experienceLevels = [],
  location = "",
  salaryMin = 0,
  sort = "recent",
}: {
  q?: string;
  jobTypes?: string[];
  experienceLevels?: string[];
  location?: string;
  salaryMin?: number;
  sort?: string;
}) {
  const head =
    "mb-3 border-b border-border pb-2.5 font-heading text-[0.7rem] font-bold uppercase tracking-[0.12em] text-muted";
  const field =
    "w-full rounded-md border-[1.5px] border-border bg-white px-3 py-2.5 font-body text-[0.86rem] text-text focus:border-primary focus:outline-none";

  return (
    <form action="/jobs" method="get" className="space-y-7">
      <div>
        <h2 className={head}>Search</h2>
        <div className="relative">
          <Icon name="search" size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-2" />
          <input type="search" name="q" defaultValue={q} aria-label="Search jobs" placeholder="Title, company, skill…" className={`${field} pl-10`} />
        </div>
      </div>

      <div>
        <h2 className={head}>Job type</h2>
        <div className="space-y-1.5">
          {JOB_TYPES.map((t) => (
            <label key={t} className="flex items-center gap-2.5 font-body text-[0.86rem] text-text">
              <input type="checkbox" name="job_type" value={t} defaultChecked={jobTypes.includes(t)} />
              {t}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h2 className={head}>Experience</h2>
        <div className="space-y-1.5">
          {EXPERIENCE_LEVELS.map((l) => (
            <label key={l} className="flex items-center gap-2.5 font-body text-[0.86rem] text-text">
              <input type="checkbox" name="experience_level" value={l} defaultChecked={experienceLevels.includes(l)} />
              {l}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h2 className={head}>Location</h2>
        <input type="text" name="location" defaultValue={location} aria-label="Filter by location" placeholder="City or state…" className={field} />
      </div>

      <div>
        <h2 className={head}>Minimum salary (LPA)</h2>
        <input
          type="range"
          name="salary_min"
          min={0}
          max={2000000}
          step={100000}
          defaultValue={salaryMin}
          aria-label="Minimum salary"
          className="w-full accent-primary"
        />
      </div>

      <div>
        <h2 className={head}>Sort</h2>
        <select name="sort" defaultValue={sort} aria-label="Sort jobs" className={`${field} appearance-none`}>
          <option value="recent">Most recent</option>
          <option value="salary">Highest salary</option>
        </select>
      </div>

      <div className="space-y-2">
        <button type="submit" className="w-full rounded-md bg-primary px-4 py-2.5 font-heading text-[0.82rem] font-bold text-white transition hover:bg-primary-deep">
          Apply filters
        </button>
        <a href="/jobs" className="block text-center font-body text-[0.8rem] text-primary hover:underline">
          Clear all filters
        </a>
      </div>
    </form>
  );
}
