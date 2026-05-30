import { describe, it, expect } from "vitest";
import { articleSchema, articleUpdateSchema } from "./article";

const valid = {
  title: "A practical HACCP rollout",
  slug: "a-practical-haccp-rollout",
  excerpt: "Short summary.",
  content_mdx: "## Heading\n\nBody.",
  category: "food-safety",
  tags: ["HACCP", "FSSAI"],
  cover_image_url: "https://example.com/cover.jpg",
  expert_id: "3f1e6c9a-1b2c-4d5e-8f90-0a1b2c3d4e5f",
  read_time_mins: 9,
  is_published: true,
  related_resource_slug: "haccp-team-charter",
};

describe("articleSchema (story-blog-06 — authorship via expert_id)", () => {
  it("accepts a well-formed payload with expert_id", () => {
    const parsed = articleSchema.parse(valid);
    expect(parsed.expert_id).toBe(valid.expert_id);
  });

  it("requires expert_id as a uuid — no free-text author_name accepted (AC#6)", () => {
    // author_name is dropped: a payload without expert_id is rejected.
    const withoutExpert: Record<string, unknown> = { ...valid };
    delete withoutExpert.expert_id;
    expect(articleSchema.safeParse(withoutExpert).success).toBe(false);

    // a non-uuid author handle is rejected.
    expect(articleSchema.safeParse({ ...valid, expert_id: "Aarti Menon" }).success).toBe(false);

    // it never silently coerces a legacy author_name field into the row.
    const parsed = articleSchema.parse({ ...valid, author_name: "Aarti Menon" });
    expect(parsed).not.toHaveProperty("author_name");
  });

  it("rejects an unknown category and a malformed slug", () => {
    expect(articleSchema.safeParse({ ...valid, category: "gossip" }).success).toBe(false);
    expect(articleSchema.safeParse({ ...valid, slug: "Not A Slug" }).success).toBe(false);
  });

  it("defaults is_published to false and read_time to 5", () => {
    const rest: Record<string, unknown> = { ...valid };
    delete rest.is_published;
    delete rest.read_time_mins;
    const parsed = articleSchema.parse(rest);
    expect(parsed.is_published).toBe(false);
    expect(parsed.read_time_mins).toBe(5);
  });

  it("update schema is a partial — accepts just an expert_id reassignment", () => {
    const parsed = articleUpdateSchema.parse({ expert_id: valid.expert_id });
    expect(parsed.expert_id).toBe(valid.expert_id);
    expect(articleUpdateSchema.safeParse({ expert_id: "nope" }).success).toBe(false);
  });
});
