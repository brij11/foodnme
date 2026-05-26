import type { Metadata } from "next";
import Link from "next/link";
import { listJobs, JOBS_PAGE_SIZE } from "@/lib/jobs";
import { PageHeader } from "@/components/listing/PageHeader";
import { ListingShell } from "@/components/listing/ListingShell";
import { JobsFilterSidebar } from "@/components/jobs/JobsFilterSidebar";
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

  const sidebar = (
    <JobsFilterSidebar
      q={q ?? ""}
      jobTypes={jobTypes}
      experienceLevels={experienceLevels}
      location={location ?? ""}
      salaryMin={salaryMin}
      sort={sort}
    />
  );

  // Build a page link preserving the current filters.
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
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <p data-testid="result-count" className="font-body text-[0.85rem] text-muted">
            <strong className="font-semibold text-text">{total}</strong> {total === 1 ? "job" : "jobs"} found
          </p>
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
