import type { Metadata } from "next";
import { listExperts } from "@/lib/experts";
import { PageHeader } from "@/components/listing/PageHeader";
import { ListingShell } from "@/components/listing/ListingShell";
import { ExpertsFilterSidebar } from "@/components/experts/ExpertsFilterSidebar";
import { ExpertCard } from "@/components/experts/ExpertCard";
import { EmptyState } from "@/components/listing/EmptyState";

export const metadata: Metadata = {
  title: "Find food-tech experts — foodnme",
  description:
    "A directory of vetted food-technology experts — auditors, consultants, R&D scientists, and regulatory specialists available for short engagements and longer projects.",
  openGraph: {
    title: "Find food-tech experts — foodnme",
    description:
      "Vetted food-technology auditors, consultants, and specialists available for hire.",
    type: "website",
  },
};

type SearchParams = {
  q?: string;
  specialization?: string | string[];
  location?: string;
  available?: string;
};

export default async function ExpertsPage({ searchParams }: { searchParams: SearchParams }) {
  const q = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const specializations =
    searchParams.specialization == null
      ? []
      : Array.isArray(searchParams.specialization)
        ? searchParams.specialization
        : [searchParams.specialization];
  const location = typeof searchParams.location === "string" ? searchParams.location : undefined;
  const available = searchParams.available === "true";

  const experts = await listExperts({ q, specializations, location, available });

  const sidebar = (
    <ExpertsFilterSidebar
      q={q ?? ""}
      specializations={specializations}
      location={location ?? ""}
      available={available}
    />
  );

  // Filter signature: changing any filter remounts the grid so the stagger re-runs (§4.10).
  const gridKey = JSON.stringify({ q, specializations, location, available });

  return (
    <div className="mx-auto max-w-content px-6 lg:px-12">
      <PageHeader
        overline="Expert Directory"
        title="Vetted food-technology experts"
        sub="Auditors, consultants, R&D scientists, and regulatory specialists available for short engagements and longer projects."
      />

      <ListingShell sidebar={sidebar}>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <p data-testid="result-count" className="font-body text-[0.85rem] text-muted">
            <strong className="font-semibold text-text">{experts.length}</strong>{" "}
            {experts.length === 1 ? "expert" : "experts"} found
          </p>
        </div>

        {experts.length > 0 ? (
          <div key={gridKey} className="grid gap-5 sm:grid-cols-2">
            {experts.map((expert, i) => (
              <div
                key={expert.id}
                className="motion-reduce:animate-none animate-fade-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <ExpertCard expert={expert} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            variant="filter"
            title="No experts match your filters"
            message="Try removing a specialization, toggling availability off, or clearing your search."
            action={{ label: "Clear filters", href: "/experts" }}
          />
        )}
      </ListingShell>
    </div>
  );
}
