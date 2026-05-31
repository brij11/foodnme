import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getResourceBySlug,
  getAllTemplateSlugs,
  getSimilarTemplates,
  parseWhatsIncluded,
} from "@/lib/resources";
import { templateCategoryLabel, templateTagVariant } from "@/lib/categories";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Tag } from "@/components/ui/Tag";
import { Badge } from "@/components/ui/Badge";
import { WhatsIncluded } from "@/components/templates/WhatsIncluded";
import { TemplateDownloadPanel } from "@/components/templates/TemplateDownloadPanel";
import { TemplateCard } from "@/components/templates/TemplateCard";

// SSG over every template; new/edited templates render on demand then cache, and an admin
// edit/upload calls revalidatePath('/templates/[slug]') (wired with the Sprint-3 admin CRUD).
export async function generateStaticParams() {
  const slugs = await getAllTemplateSlugs();
  return slugs.map((slug) => ({ slug }));
}
export const dynamicParams = true;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const template = await getResourceBySlug(params.slug);
  if (!template) return { title: "Template not found — foodnme" };
  const description = parseWhatsIncluded(template.description).intro ?? template.description;
  const title = `${template.title} — foodnme`;
  return {
    title,
    description,
    openGraph: { title: template.title, description, type: "article" },
    twitter: { card: "summary_large_image", title: template.title, description },
  };
}

export default async function TemplateDetailPage({ params }: { params: { slug: string } }) {
  const template = await getResourceBySlug(params.slug);
  if (!template) notFound();

  const similar = await getSimilarTemplates(template.slug, template.category, 3);

  return (
    <div className="mx-auto max-w-content px-6 py-10 lg:px-12">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Templates", href: "/templates" },
          { label: templateCategoryLabel(template.category) },
        ]}
      />

      <header className="mb-10 mt-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Tag variant={templateTagVariant(template.category)}>{templateCategoryLabel(template.category)}</Tag>
          <Badge>{template.file_type.toUpperCase()}</Badge>
        </div>
        {/* Inter 700 (font-heading), not Fraunces — Fraunces is hero-H1 only (§1.3). */}
        <h1 className="max-w-content font-heading text-[clamp(1.9rem,3.6vw,2.4rem)] font-bold leading-[1.1] tracking-[-0.02em] text-text">
          {template.title}
        </h1>
      </header>

      <div className="grid items-start gap-10 lg:grid-cols-[1.5fr_1fr]">
        <div className="flex flex-col gap-6">
          <WhatsIncluded
            description={template.description}
            fileType={template.file_type}
            downloadCount={template.download_count}
            createdAt={template.created_at}
          />

          <div className="rounded-lg border border-border bg-surface-light p-7">
            {/* primary-deep (not primary) on surface-light to clear the AA contrast gate (§1) */}
            <p className="font-heading text-[0.65rem] font-bold uppercase tracking-[0.14em] text-primary-deep">
              Customization
            </p>
            <h2 className="mt-2 font-heading text-[1.1rem] font-bold text-text">
              Need a custom version for your facility?
            </h2>
            <p className="mb-5 mt-2 font-body text-[0.92rem] leading-relaxed text-muted">
              We adapt any template to your specific processes, products, and regulatory scope. Typical turnaround:
              5 business days.
            </p>
            <Link
              href="/services#inquiry"
              className="inline-flex items-center justify-center rounded-md border border-border bg-white px-5 py-2.5 font-heading text-[0.82rem] font-bold text-text transition hover:border-primary hover:text-primary"
            >
              Request customization
            </Link>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24">
          <TemplateDownloadPanel templateId={template.id} fileType={template.file_type} />
        </aside>
      </div>

      {similar.length > 0 ? (
        <section className="mt-20" aria-labelledby="similar-heading">
          <p className="mb-3 font-heading text-[0.65rem] font-bold uppercase tracking-[0.14em] text-primary">
            Related
          </p>
          <h2 id="similar-heading" className="mb-8 font-display text-[1.6rem] font-semibold tracking-[-0.02em] text-text">
            Similar templates
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((t, i) => (
              <div
                key={t.slug}
                className="motion-reduce:animate-none animate-fade-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <TemplateCard template={t} />
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
