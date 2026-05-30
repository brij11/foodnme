import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getExpertById, getSimilarExperts, expertInitials, formatHourlyRate } from "@/lib/experts";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import { ContactExpertButton } from "@/components/experts/ContactExpertButton";
import { ExpertCard } from "@/components/experts/ExpertCard";
import { SaveButton } from "@/components/jobs/SaveButton";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const expert = await getExpertById(params.id);
  if (!expert) return { title: "Expert not found — foodnme" };
  const desc = `${expert.title} · ${expert.location}. ${expert.specializations.slice(0, 3).join(", ")}.`;
  return {
    title: `${expert.full_name} — ${expert.title} | foodnme`,
    description: desc,
    openGraph: { title: `${expert.full_name} — ${expert.title}`, description: desc, type: "profile" },
  };
}

export default async function ExpertDetailPage({ params }: { params: { id: string } }) {
  const expert = await getExpertById(params.id);
  if (!expert) notFound();

  const similar = await getSimilarExperts(expert, 3);

  return (
    <div className="mx-auto max-w-content px-6 pt-8 lg:px-12">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Experts", href: "/experts" },
          { label: expert.full_name },
        ]}
      />

      {/* Hero */}
      <div className="flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-5">
          {expert.avatar_url ? (
            <Image
              src={expert.avatar_url}
              alt=""
              width={80}
              height={80}
              className="h-20 w-20 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-tag-safe-bg font-heading text-[1.5rem] font-bold text-tag-safe-text">
              {expertInitials(expert.full_name)}
            </div>
          )}
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-heading text-[1.9rem] font-bold tracking-[-0.02em] text-text">
                {expert.full_name}
              </h1>
              {expert.is_featured ? (
                <Tag variant="safe">
                  <Icon name="verified" size={11} stroke={2.4} /> Verified
                </Tag>
              ) : null}
            </div>
            <p className="mt-1 font-body text-[1.02rem] text-muted">{expert.title}</p>
            <p className="mt-2 flex items-center gap-1.5 font-body text-[0.86rem] text-muted">
              <Icon name="map-pin" size={14} stroke={1.8} /> {expert.location}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-5">
              <span className="font-body text-[0.86rem] text-muted">
                <strong className="text-text">{expert.experience_years} years</strong> experience
              </span>
              <span
                data-testid="availability"
                className="flex items-center gap-1.5 font-body text-[0.86rem] text-muted"
              >
                <span
                  aria-hidden
                  className={`h-2 w-2 rounded-full ${expert.is_available ? "bg-secondary" : "bg-muted-2"}`}
                />
                {expert.is_available ? "Available" : "Not available"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-3 md:items-end">
          <div className="font-heading text-[1.4rem] font-extrabold tracking-[-0.02em] text-text">
            {formatHourlyRate(expert.hourly_rate)}
          </div>
          <ContactExpertButton
            expertId={expert.id}
            expertName={expert.full_name}
            isAvailable={expert.is_available}
          />
          <div className="w-full md:w-auto md:min-w-[200px]">
            <SaveButton
              itemType="expert"
              itemId={expert.id}
              variant="detail"
              unsavedLabel="Save profile"
            />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_300px]">
        <div>
          <h2 className="font-heading text-[1.3rem] font-bold text-text">About</h2>
          <p className="mt-3.5 font-body text-[1.02rem] leading-relaxed text-text">{expert.bio}</p>

          <h3 className="mt-8 font-heading text-[1.1rem] font-bold text-text">Specializations</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {expert.specializations.map((s) => (
              <Tag key={s} variant="outline-green">
                {s}
              </Tag>
            ))}
          </div>

          <h3 className="mt-8 font-heading text-[1.1rem] font-bold text-text">Certifications</h3>
          <ul className="mt-3 flex flex-col gap-2.5">
            {expert.certifications.map((c) => (
              <li key={c} className="flex items-center gap-2.5 font-body text-[0.95rem] text-text">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-tag-safe-bg text-tag-safe-text">
                  <Icon name="check" size={12} stroke={2.6} />
                </span>
                {c}
              </li>
            ))}
          </ul>

          {expert.engagement_types.length > 0 ? (
            <section data-testid="engagement-types">
              <h3 className="mt-8 font-heading text-[1.1rem] font-bold text-text">Engagement types</h3>
              <div className="mt-3 flex flex-col gap-3">
                {expert.engagement_types.map((e) => (
                  <div
                    key={e.kind}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card-bg px-5 py-4"
                  >
                    <div className="min-w-0">
                      <div className="font-heading text-[0.95rem] font-bold text-text">{e.title}</div>
                      <p className="mt-0.5 font-body text-[0.84rem] text-muted">{e.desc}</p>
                    </div>
                    <span className="font-heading text-[0.92rem] font-bold text-primary">{e.price}</span>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="h-fit rounded-lg border border-border bg-card-bg p-6">
          <h2 className="mb-4 font-heading text-[0.95rem] font-bold text-text">Quick stats</h2>
          <dl className="flex flex-col gap-3" data-testid="quick-stats">
            {expert.review_count > 0 && expert.rating != null ? (
              <>
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <dt className="font-body text-[0.82rem] text-muted">Rating</dt>
                  <dd className="flex items-center gap-1 font-heading text-[0.86rem] font-bold text-text">
                    <Icon name="star" size={13} className="text-accent" />
                    {expert.rating.toFixed(1)} / 5.0
                  </dd>
                </div>
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <dt className="font-body text-[0.82rem] text-muted">Reviews</dt>
                  <dd className="font-heading text-[0.86rem] font-bold text-text">{expert.review_count}</dd>
                </div>
              </>
            ) : null}
            {expert.response_time ? (
              <div className="flex items-center justify-between border-b border-border pb-3">
                <dt className="font-body text-[0.82rem] text-muted">Response time</dt>
                <dd className="font-heading text-[0.86rem] font-bold text-text">{expert.response_time}</dd>
              </div>
            ) : null}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <dt className="font-body text-[0.82rem] text-muted">Experience</dt>
              <dd className="font-heading text-[0.86rem] font-bold text-text">
                {expert.experience_years} years
              </dd>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <dt className="font-body text-[0.82rem] text-muted">Rate</dt>
              <dd className="font-heading text-[0.86rem] font-bold text-text">
                {formatHourlyRate(expert.hourly_rate)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="font-body text-[0.82rem] text-muted">Location</dt>
              <dd className="font-heading text-[0.86rem] font-bold text-text">
                {expert.location.split(" · ")[0]}
              </dd>
            </div>
          </dl>
        </aside>
      </div>

      {similar.length > 0 ? (
        <section className="mt-14 border-t border-border pt-10">
          <h2 className="font-heading text-[1.3rem] font-bold text-text">Similar experts</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((e) => (
              <ExpertCard key={e.id} expert={e} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
