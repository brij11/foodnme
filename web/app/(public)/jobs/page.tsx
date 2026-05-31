import type { Metadata } from "next";
import Link from "next/link";
import { listJobs, JOBS_PAGE_SIZE } from "@/lib/jobs";
import { PageHeader } from "@/components/listing/PageHeader";
import { ListingShell } from "@/components/listing/ListingShell";
import { JobsFilterSidebar } from "@/components/jobs/JobsFilterSidebar";
import { SalarySliderIsland } from "@/components/jobs/SalarySliderIsland";
import { JobCard } from "@/components/jobs/JobCard";
import { EmptyState } from "@/components/listing/EmptyState";

export const metadata: Metadata = {
  title: "Food-tech jobs — foodnme",
  description:
    "Browse active food-technology roles across India — QA, food safety, R&D, regulatory, and production jobs from vetted employers.",
  openGraph: { title: "Food-tech jobs — foodnme", description: "Active food-technology roles across India.", type: "website" },
};

function asArray(v: string | string[] | undefined): string[] {
  return v == null ? [] : Array.isArray(v) ? v : [v];
}

type SearchParams = {
  q?: string;
  job_type?: string | string[];
  experience_level?: string | string[];
  location?: string;
  salary_min?: string;
  sort?: string;
  page?: string;
};

export default async function JobsPage({ searchParams }: { searchParams: SearchParams }) {
  const q = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const jobTypes = asArray(searchParams.job_type);
  const experienceLevels = asArray(searchParams.experience_level);
  const location = typeof searchParams.location === "string" ? searchParams.location : undefined;
  const salaryMin = searchParams.salary_min ? Number(searchParams.salary_min) : 0;
  const sort = searchParams.sort === "salary" ? "salary" : "recent";
  const page = Math.max(1, Number(searchParams.page) || 1);

  const { jobs, total } = await listJobs({ q, jobTypes, experienceLevels, location, salaryMin, sort, page });
  const totalPages = Math.max(1, Math.ceil(total / JOBS_PAGE_SIZE));

  // story-jobs-16 D9: SalarySliderIsland injected for live LPA readout.
  // story-jobs-16 B13: sort control moved to results header.
  const sidebar = (
    <JobsFilterSidebar
      q={q ?? ""}
      jobTypes={jobTypes}
      experienceLevels={experienceLevels}
      location={location ?? ""}
      salaryMin={salaryMin}
      sliderIsland={<SalarySliderIsland initialValue={salaryMin} />}
    />
  );

  function pageHref(p: number): string {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    for (const t of jobTypes) sp.append("job_type", t);
    for (const l of experienceLevels) sp.append("experience_level", l);
    if (location) sp.set("location", location);
    if (salaryMin) sp.set("salary_min", String(salaryMin));
    if (sort !== "recent") sp.set("sort", sort);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `/jobs?${qs}` : "/jobs";
  }

  const gridKey = JSON.stringify({ q, jobTypes, experienceLevels, location, salaryMin, sort, page });

  return (
    <div className="mx-auto max-w-content px-6 lg:px-12">
      <PageHeader
        overline="Job Board"
        title="Food-tech jobs across India"
        sub="QA, food safety, R&D, regulatory, and production roles from vetted employers — filtered to what you can actually apply to."
      />

      <ListingShell sidebar={sidebar}>
        {/* Results header: count + sort control.
            story-jobs-16 B13: sort moved from sidebar to results header (DEVIATIONS B13). */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <p data-testid="result-count" className="font-body text-[0.85rem] text-muted">
            <strong className="font-semibold text-text">{total}</strong> {total === 1 ? "job" : "jobs"} found
          </p>
          <form method="get" action="/jobs" className="flex items-center gap-2" data-testid="sort-form">
            {q ? <input type="hidden" name="q" value={q} /> : null}
            {jobTypes.map((t) => <input key={t} type="hidden" name="job_type" value={t} />)}
            {experienceLevels.map((l) => <input key={l} type="hidden" name="experience_level" value={l} />)}
            {location ? <input type="hidden" name="location" value={location} /> : null}
            {salaryMin > 0 ? <input type="hidden" name="salary_min" value={salaryMin} /> : null}
            <label htmlFor="sort-select" className="font-body text-[0.78rem] text-muted">
              Sort:
            </label>
            <select
              id="sort-select"
              name="sort"
              defaultValue={sort}
              aria-label="Sort jobs"
              className="rounded-md border-[1.5px] border-border bg-white px-3 py-1.5 font-body text-[0.82rem] text-text focus:border-primary focus:outline-none"
              data-testid="sort-select"
            >
              <option value="recent">Most recent</option>
              <option value="salary">Highest salary</option>
            </select>
            <button
              type="submit"
              className="rounded-md border-[1.5px] border-border bg-white px-2.5 py-1.5 font-body text-[0.78rem] text-muted hover:border-primary hover:text-primary"
            >
              Go
            </button>
          </form>
        </div>

        {jobs.length > 0 ? (
          <>
            <div key={gridKey} className="grid gap-5 sm:grid-cols-2">
              {jobs.map((job, i) => (
                <div key={job.id} className="motion-reduce:animate-none animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                  <JobCard job={job} />
                </div>
              ))}
            </div>
            {totalPages > 1 ? (
              <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-4">
                {page > 1 ? (
                  <Link href={pageHref(page - 1)} className="rounded-md border-[1.5px] border-border px-4 py-2 font-heading text-[0.8rem] font-bold text-primary hover:border-primary">
                    Previous
                  </Link>
                ) : null}
                <span data-testid="page-indicator" className="font-body text-[0.82rem] text-muted">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages ? (
                  <Link href={pageHref(page + 1)} className="rounded-md border-[1.5px] border-border px-4 py-2 font-heading text-[0.8rem] font-bold text-primary hover:border-primary">
                    Next
                  </Link>
                ) : null}
              </nav>
            ) : null}
          </>
        ) : (
          <EmptyState
            variant="filter"
            title="No jobs match your filters"
            message="Try removing a filter, lowering the salary floor, or clearing your search."
            action={{ label: "Clear filters", href: "/jobs" }}
          />
        )}
      </ListingShell>
    </div>
  );
}
