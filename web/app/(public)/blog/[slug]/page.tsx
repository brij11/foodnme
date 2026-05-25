import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getArticleBySlug, getPublishedSlugs, getRelatedArticles } from "@/lib/articles";
import { getResourceBySlug } from "@/lib/resources";
import { articleCategoryLabel, articleTagVariant } from "@/lib/categories";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ArticleBody } from "@/components/blog/ArticleBody";
import { ArticleTemplateCTA } from "@/components/blog/ArticleTemplateCTA";
import { RelatedArticles } from "@/components/blog/RelatedArticles";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import { NewsletterBanner } from "@/components/newsletter/NewsletterBanner";

// SSG over published articles; new/edited articles render on demand then cache, and an admin
// publish action calls revalidatePath('/blog/[slug]') (wired with the Sprint-3 admin CRUD).
export async function generateStaticParams() {
  const slugs = await getPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}
export const dynamicParams = true;

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric" }).format(
    new Date(iso),
  );
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);
  if (!article) return { title: "Article not found — foodnme" };
  return {
    title: `${article.title} — foodnme`,
    description: article.excerpt,
    openGraph: { title: article.title, description: article.excerpt, type: "article" },
    twitter: { card: "summary_large_image", title: article.title, description: article.excerpt },
  };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticleBySlug(params.slug);
  if (!article) notFound();

  // In-article CTA target + "You might also like" row (blog-05). The CTA only renders when the
  // article's related_resource_slug resolves to a real template.
  const [relatedResource, relatedArticles] = await Promise.all([
    article.related_resource_slug ? getResourceBySlug(article.related_resource_slug) : Promise.resolve(null),
    getRelatedArticles(article.slug, article.category, 3),
  ]);

  return (
    <article className="mx-auto max-w-content px-6 py-12 lg:px-12">
      <div className="mx-auto max-w-article">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Blog", href: "/blog" },
            { label: articleCategoryLabel(article.category), href: `/blog/category/${article.category}` },
          ]}
        />
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Tag variant={articleTagVariant(article.category)}>{articleCategoryLabel(article.category)}</Tag>
          <Tag variant="neutral">
            <Icon name="clock" size={11} stroke={2} />
            {article.read_time_mins} min read
          </Tag>
        </div>
        <h1 className="font-display text-[clamp(2rem,4vw,2.5rem)] font-bold leading-[1.1] tracking-[-0.03em] text-text">
          {article.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-2 font-body text-[0.85rem] text-muted">
          <span className="font-medium text-text">{article.author_name}</span>
          <span aria-hidden>·</span>
          <span>{formatDate(article.published_at)}</span>
          <span aria-hidden>·</span>
          <span>{article.read_time_mins} min read</span>
        </div>
      </div>

      {article.cover_image_url ? (
        <div className="relative mx-auto mt-8 aspect-[16/8] max-w-[1000px] overflow-hidden rounded-lg bg-surface-light">
          <Image
            src={article.cover_image_url}
            alt=""
            fill
            priority
            sizes="(max-width: 1000px) 100vw, 1000px"
            className="object-cover"
          />
        </div>
      ) : null}

      <div className="mt-10">
        <ArticleBody mdx={article.content_mdx} />
      </div>

      <ArticleTemplateCTA resource={relatedResource} />

      {article.tags.length > 0 ? (
        <div className="mx-auto mt-10 flex max-w-article flex-wrap gap-2">
          {article.tags.map((t) => (
            <Tag key={t} variant="outline-green">
              {t}
            </Tag>
          ))}
        </div>
      ) : null}

      <RelatedArticles articles={relatedArticles} />

      <div className="mt-16">
        <NewsletterBanner
          source="article"
          headline="Keep this kind of guidance coming."
          subtext="One practical food-tech email a week. No spam, unsubscribe anytime."
        />
      </div>
    </article>
  );
}
